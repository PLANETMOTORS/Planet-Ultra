import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FinanceApplicationPayload } from '@/types/a5';

const originalEnv = { ...process.env };

function basePayload(): FinanceApplicationPayload {
  return {
    vehicleId: 'v-1',
    vehicleSlug: '2024-toyota-camry-le',
    vehicleYear: 2024,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehiclePriceCad: 35000,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '416-555-1234',
    downPaymentCad: 5000,
    termMonths: 60,
    clerkUserId: null,
  };
}

describe('Finance Submission Boundary', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns "queued" when both lenders are disabled', async () => {
    process.env.ENABLE_ROUTEONE = '0';
    process.env.ENABLE_DEALERTRACK = '0';
    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    const result = await submitFinanceApplication(basePayload());
    expect(result.status).toBe('queued');
    expect(result.message).toContain('finance team');
  });

  it('tries RouteOne first when enabled', async () => {
    process.env.ENABLE_ROUTEONE = '1';
    process.env.ROUTEONE_API_URL = 'https://routeone.test';
    process.env.ROUTEONE_DEALER_ID = 'dealer-1';
    process.env.ROUTEONE_API_KEY = 'key-1';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ application_id: 'ro-abc-123' }),
    }));

    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    const result = await submitFinanceApplication(basePayload());
    expect(result.status).toBe('accepted');
    expect(result.referenceId).toBe('ro-abc-123');
  });

  it('falls through to Dealertrack when RouteOne fails', async () => {
    process.env.ENABLE_ROUTEONE = '1';
    process.env.ROUTEONE_API_URL = 'https://routeone.test';
    process.env.ROUTEONE_DEALER_ID = 'dealer-1';
    process.env.ROUTEONE_API_KEY = 'key-1';
    process.env.ENABLE_DEALERTRACK = '1';
    process.env.DEALERTRACK_API_URL = 'https://dealertrack.test';
    process.env.DEALERTRACK_DEALER_ID = 'dealer-2';
    process.env.DEALERTRACK_API_KEY = 'key-2';

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      callCount++;
      if (url.includes('routeone')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ applicationId: 'dt-xyz-789' }),
      });
    }));

    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    const result = await submitFinanceApplication(basePayload());
    expect(result.status).toBe('accepted');
    expect(result.referenceId).toBe('dt-xyz-789');
    expect(callCount).toBe(2);
  });

  it('returns "failed" when both lenders fail', async () => {
    process.env.ENABLE_ROUTEONE = '1';
    process.env.ROUTEONE_API_URL = 'https://routeone.test';
    process.env.ROUTEONE_DEALER_ID = 'd';
    process.env.ROUTEONE_API_KEY = 'k';
    process.env.ENABLE_DEALERTRACK = '1';
    process.env.DEALERTRACK_API_URL = 'https://dealertrack.test';
    process.env.DEALERTRACK_DEALER_ID = 'd';
    process.env.DEALERTRACK_API_KEY = 'k';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    const result = await submitFinanceApplication(basePayload());
    expect(result.status).toBe('failed');
    expect(result.message).toContain('follow up');
  });

  it('RouteOne payload includes correct structure', async () => {
    process.env.ENABLE_ROUTEONE = '1';
    process.env.ROUTEONE_API_URL = 'https://routeone.test';
    process.env.ROUTEONE_DEALER_ID = 'dealer-1';
    process.env.ROUTEONE_API_KEY = 'key-1';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ application_id: 'test' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    await submitFinanceApplication(basePayload());

    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toBe('https://routeone.test/applications');

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(callBody.applicant.first_name).toBe('Jane');
    expect(callBody.applicant.email).toBe('jane@example.com');
    expect(callBody.vehicle.make).toBe('Toyota');
    expect(callBody.terms.down_payment_cad).toBe(5000);
  });

  it('Dealertrack uses different endpoint path', async () => {
    process.env.ENABLE_ROUTEONE = '0';
    process.env.ENABLE_DEALERTRACK = '1';
    process.env.DEALERTRACK_API_URL = 'https://dealertrack.test';
    process.env.DEALERTRACK_DEALER_ID = 'dealer-2';
    process.env.DEALERTRACK_API_KEY = 'key-2';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ applicationId: 'dt-test' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    await submitFinanceApplication(basePayload());

    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toBe('https://dealertrack.test/credit-applications');
  });

  it('throws when RouteOne env vars are missing', async () => {
    process.env.ENABLE_ROUTEONE = '1';
    // No ROUTEONE_API_URL, etc.
    process.env.ENABLE_DEALERTRACK = '0';

    const { submitFinanceApplication } = await import('@/lib/finance/submissionBoundary');
    // RouteOne throws, no Dealertrack → queued
    const result = await submitFinanceApplication(basePayload());
    // Falls through RouteOne error to queued (Dealertrack off)
    expect(result.status).toBe('queued');
  });
});
