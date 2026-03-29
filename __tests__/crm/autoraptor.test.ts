import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CrmEventPayload } from '@/types/a5';

// ---------------------------------------------------------------------------
// Test-scoped env + fetch mock
// ---------------------------------------------------------------------------
const originalEnv = { ...process.env };

function setEnv(overrides: Record<string, string>) {
  Object.assign(process.env, overrides);
}

function mockFetch(response: { ok: boolean; status: number; json?: unknown }) {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: () => Promise.resolve(response.json ?? {}),
  });
}

function baseCrmEvent(overrides: Partial<CrmEventPayload> = {}): CrmEventPayload {
  return {
    eventType: 'soft_lead',
    vehicleId: 'v-123',
    vehicleSlug: '2024-toyota-camry-le',
    vehicleYear: 2024,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    occurredAt: '2026-03-29T12:00:00.000Z',
    ...overrides,
  };
}

describe('AutoRaptor CRM adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns status "disabled" when ENABLE_AUTORAPTOR is not 1', async () => {
    setEnv({ ENABLE_AUTORAPTOR: '0' });
    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    const result = await dispatchCrmEvent(baseCrmEvent());
    expect(result.status).toBe('disabled');
    expect(result.eventType).toBe('soft_lead');
  });

  it('returns error when API URL/key missing', async () => {
    setEnv({ ENABLE_AUTORAPTOR: '1' });
    // No AUTORAPTOR_API_URL or AUTORAPTOR_API_KEY set
    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    const result = await dispatchCrmEvent(baseCrmEvent());
    expect(result.status).toBe('error');
    expect(result.error).toContain('Missing configuration');
  });

  it('sends event and returns "sent" on success', async () => {
    setEnv({
      ENABLE_AUTORAPTOR: '1',
      AUTORAPTOR_API_URL: 'https://api.autoraptor.test',
      AUTORAPTOR_API_KEY: 'test-key',
    });
    const fetchMock = mockFetch({ ok: true, status: 200, json: { id: 'lead-456' } });
    vi.stubGlobal('fetch', fetchMock);

    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    const result = await dispatchCrmEvent(baseCrmEvent());

    expect(result.status).toBe('sent');
    expect(result.referenceId).toBe('lead-456');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Verify payload structure
    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(callBody.lead_type).toBe('Internet');
    expect(callBody.vehicle.make).toBe('Toyota');
    expect(callBody.source).toBe('planet-ultra');
  });

  it('retries once on 5xx and succeeds on second attempt', async () => {
    setEnv({
      ENABLE_AUTORAPTOR: '1',
      AUTORAPTOR_API_URL: 'https://api.autoraptor.test',
      AUTORAPTOR_API_KEY: 'test-key',
    });

    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'retry-ok' }) });
    }));

    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    const result = await dispatchCrmEvent(baseCrmEvent());
    expect(result.status).toBe('sent');
    expect(callCount).toBe(2);
  });

  it('does NOT retry on 4xx', async () => {
    setEnv({
      ENABLE_AUTORAPTOR: '1',
      AUTORAPTOR_API_URL: 'https://api.autoraptor.test',
      AUTORAPTOR_API_KEY: 'test-key',
    });
    const fetchMock = mockFetch({ ok: false, status: 422 });
    vi.stubGlobal('fetch', fetchMock);

    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    const result = await dispatchCrmEvent(baseCrmEvent());
    expect(result.status).toBe('error');
    expect(result.error).toContain('422');
    expect(fetchMock).toHaveBeenCalledTimes(1); // no retry
  });

  it('maps event types correctly', async () => {
    setEnv({
      ENABLE_AUTORAPTOR: '1',
      AUTORAPTOR_API_URL: 'https://api.autoraptor.test',
      AUTORAPTOR_API_KEY: 'test-key',
    });

    const fetchMock = mockFetch({ ok: true, status: 200, json: { id: 'x' } });
    vi.stubGlobal('fetch', fetchMock);

    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');

    const types: Array<[CrmEventPayload['eventType'], string]> = [
      ['soft_lead', 'Internet'],
      ['finance_lead', 'Finance'],
      ['purchase_deposit', 'Deposit'],
      ['vehicle_view', 'VehicleView'],
    ];

    for (const [eventType, expectedLeadType] of types) {
      fetchMock.mockClear();
      await dispatchCrmEvent(baseCrmEvent({ eventType }));
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.lead_type).toBe(expectedLeadType);
    }
  });

  it('includes PII fields when present', async () => {
    setEnv({
      ENABLE_AUTORAPTOR: '1',
      AUTORAPTOR_API_URL: 'https://api.autoraptor.test',
      AUTORAPTOR_API_KEY: 'test-key',
    });
    const fetchMock = mockFetch({ ok: true, status: 200, json: { id: 'x' } });
    vi.stubGlobal('fetch', fetchMock);

    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    await dispatchCrmEvent(baseCrmEvent({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '416-555-1234',
    }));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.first_name).toBe('Jane');
    expect(body.last_name).toBe('Doe');
    expect(body.email).toBe('jane@example.com');
    expect(body.phone).toBe('416-555-1234');
  });

  it('omits PII fields when not present', async () => {
    setEnv({
      ENABLE_AUTORAPTOR: '1',
      AUTORAPTOR_API_URL: 'https://api.autoraptor.test',
      AUTORAPTOR_API_KEY: 'test-key',
    });
    const fetchMock = mockFetch({ ok: true, status: 200, json: { id: 'x' } });
    vi.stubGlobal('fetch', fetchMock);

    const { dispatchCrmEvent } = await import('@/lib/crm/autoraptor');
    await dispatchCrmEvent(baseCrmEvent()); // no PII

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('first_name');
    expect(body).not.toHaveProperty('email');
  });
});

// ---------------------------------------------------------------------------
// Event builders
// ---------------------------------------------------------------------------
describe('CRM event builders', () => {
  it('buildSoftLeadEvent sets correct eventType', async () => {
    const { buildSoftLeadEvent } = await import('@/lib/crm/autoraptor');
    const event = buildSoftLeadEvent({
      vehicleId: 'v-1',
      vehicleSlug: 'slug',
      vehicleYear: 2024,
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
    });
    expect(event.eventType).toBe('soft_lead');
    expect(event.occurredAt).toBeDefined();
  });

  it('buildFinanceLeadEvent sets correct eventType', async () => {
    const { buildFinanceLeadEvent } = await import('@/lib/crm/autoraptor');
    const event = buildFinanceLeadEvent({
      vehicleId: 'v-1',
      vehicleSlug: 'slug',
      vehicleYear: 2024,
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      phone: '555-1234',
    });
    expect(event.eventType).toBe('finance_lead');
  });

  it('buildDepositEvent sets correct eventType', async () => {
    const { buildDepositEvent } = await import('@/lib/crm/autoraptor');
    const event = buildDepositEvent({
      vehicleId: 'v-1',
      vehicleSlug: 'slug',
      vehicleYear: 2024,
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      clerkUserId: 'clerk-123',
    });
    expect(event.eventType).toBe('purchase_deposit');
    expect(event.clerkUserId).toBe('clerk-123');
  });
});
