import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = { ...process.env };

function createRequest(body: unknown, headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
    json: () => Promise.resolve(body),
  };
}

describe('Stub Webhook Handlers', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // -----------------------------------------------------------------------
  // RouteOne
  // -----------------------------------------------------------------------
  describe('RouteOne — /api/webhooks/routeone', () => {
    it('returns 200 when no secret is configured (passthrough)', async () => {
      delete process.env.ROUTEONE_WEBHOOK_SECRET;
      const { POST } = await import('@/app/api/webhooks/routeone/route');
      const req = createRequest({ type: 'status_update' });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('stub');
    });

    it('returns 401 when secret is configured but wrong', async () => {
      process.env.ROUTEONE_WEBHOOK_SECRET = 'correct-secret';
      const { POST } = await import('@/app/api/webhooks/routeone/route');
      const req = createRequest({}, { 'x-routeone-secret': 'wrong-secret' });
      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 200 when secret matches', async () => {
      process.env.ROUTEONE_WEBHOOK_SECRET = 'correct-secret';
      const { POST } = await import('@/app/api/webhooks/routeone/route');
      const req = createRequest({}, { 'x-routeone-secret': 'correct-secret' });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    });
  });

  // -----------------------------------------------------------------------
  // Dealertrack
  // -----------------------------------------------------------------------
  describe('Dealertrack — /api/webhooks/dealertrack', () => {
    it('returns 200 when no secret is configured', async () => {
      delete process.env.DEALERTRACK_WEBHOOK_SECRET;
      const { POST } = await import('@/app/api/webhooks/dealertrack/route');
      const req = createRequest({ type: 'callback' });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    });

    it('returns 401 when secret is wrong', async () => {
      process.env.DEALERTRACK_WEBHOOK_SECRET = 'dt-secret';
      const { POST } = await import('@/app/api/webhooks/dealertrack/route');
      const req = createRequest({}, { 'x-dealertrack-secret': 'wrong' });
      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 200 when secret matches', async () => {
      process.env.DEALERTRACK_WEBHOOK_SECRET = 'dt-secret';
      const { POST } = await import('@/app/api/webhooks/dealertrack/route');
      const req = createRequest({}, { 'x-dealertrack-secret': 'dt-secret' });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    });
  });

  // -----------------------------------------------------------------------
  // AutoRaptor
  // -----------------------------------------------------------------------
  describe('AutoRaptor — /api/webhooks/autoraptor', () => {
    it('returns 200 when no secret is configured', async () => {
      delete process.env.AUTORAPTOR_WEBHOOK_SECRET;
      const { POST } = await import('@/app/api/webhooks/autoraptor/route');
      const req = createRequest({ type: 'lead_update' });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    });

    it('returns 401 when secret is wrong', async () => {
      process.env.AUTORAPTOR_WEBHOOK_SECRET = 'ar-secret';
      const { POST } = await import('@/app/api/webhooks/autoraptor/route');
      const req = createRequest({}, { 'x-autoraptor-secret': 'wrong' });
      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 200 when secret matches', async () => {
      process.env.AUTORAPTOR_WEBHOOK_SECRET = 'ar-secret';
      const { POST } = await import('@/app/api/webhooks/autoraptor/route');
      const req = createRequest({}, { 'x-autoraptor-secret': 'ar-secret' });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.received).toBe(true);
      expect(body.status).toBe('stub');
    });
  });
});
