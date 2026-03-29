import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { DepositIntentRequest } from '@/types/a5';

const originalEnv = { ...process.env };

function baseRequest(): DepositIntentRequest {
  return {
    vehicleId: 'v-123',
    vehicleSlug: '2024-toyota-camry-le',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2024,
    vehiclePriceCad: 35000,
    clerkUserId: 'clerk_user_1',
  };
}

describe('Stripe Deposit Intent', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('when ENABLE_STRIPE_DEPOSITS is off', () => {
    beforeEach(() => {
      process.env.ENABLE_STRIPE_DEPOSITS = '0';
    });

    it('returns a stub session', async () => {
      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      const result = await createDepositSession(baseRequest());
      expect(result.sessionId).toContain('stub_session_');
      expect(result.sessionId).toContain('v-123');
      expect(result.vehicleId).toBe('v-123');
    });

    it('returns the default deposit amount (50000 cents = $500)', async () => {
      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      const result = await createDepositSession(baseRequest());
      expect(result.amountCents).toBe(50000);
    });

    it('returns publishable key from env', async () => {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_abc';
      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      const result = await createDepositSession(baseRequest());
      expect(result.publishableKey).toBe('pk_test_abc');
    });

    it('does not call Stripe API', async () => {
      const mockCreate = vi.fn();
      vi.doMock('stripe', () => ({
        default: vi.fn().mockImplementation(() => ({
          checkout: { sessions: { create: mockCreate } },
        })),
      }));
      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      await createDepositSession(baseRequest());
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('when ENABLE_STRIPE_DEPOSITS is on', () => {
    beforeEach(() => {
      process.env.ENABLE_STRIPE_DEPOSITS = '1';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_xyz';
    });

    it('throws if STRIPE_SECRET_KEY is missing', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      await expect(createDepositSession(baseRequest())).rejects.toThrow(
        'STRIPE_SECRET_KEY is not configured',
      );
    });

    it('creates a Stripe checkout session', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_secret';
      process.env.NEXT_PUBLIC_SITE_URL = 'https://planetmotors.ca';

      const mockCreate = vi.fn().mockResolvedValue({ id: 'cs_test_session_id' });
      vi.doMock('stripe', () => ({
        default: class MockStripe {
          checkout = { sessions: { create: mockCreate } };
          webhooks = {};
        },
      }));

      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      const result = await createDepositSession(baseRequest());

      expect(result.sessionId).toBe('cs_test_session_id');
      expect(result.publishableKey).toBe('pk_test_xyz');
      expect(result.vehicleId).toBe('v-123');

      // Verify checkout session params
      const createArgs = mockCreate.mock.calls[0][0];
      expect(createArgs.mode).toBe('payment');
      expect(createArgs.line_items[0].price_data.currency).toBe('cad');
      expect(createArgs.line_items[0].price_data.unit_amount).toBe(50000);
      expect(createArgs.metadata.vehicleId).toBe('v-123');
      expect(createArgs.metadata.clerkUserId).toBe('clerk_user_1');
      expect(createArgs.success_url).toContain('deposit=success');
      expect(createArgs.cancel_url).toContain('deposit=cancelled');
    });

    it('uses custom deposit amount from env', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_secret';
      process.env.STRIPE_DEPOSIT_AMOUNT_CENTS = '100000'; // $1000

      const mockCreate = vi.fn().mockResolvedValue({ id: 'cs_test' });
      vi.doMock('stripe', () => ({
        default: class MockStripe {
          checkout = { sessions: { create: mockCreate } };
        },
      }));

      const { createDepositSession } = await import('@/lib/stripe/depositIntent');
      const result = await createDepositSession(baseRequest());

      expect(result.amountCents).toBe(100000);
    });
  });
});
