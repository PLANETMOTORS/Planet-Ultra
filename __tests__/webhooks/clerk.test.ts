import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = { ...process.env };

function createRequest(body: string, headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
    text: () => Promise.resolve(body),
  };
}

describe('Clerk Webhook — /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns 500 when CLERK_WEBHOOK_SECRET is not set', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const { POST } = await import('@/app/api/webhooks/clerk/route');
    const req = createRequest('{}');
    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });

  it('returns 400 when svix headers are missing', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';
    const { POST } = await import('@/app/api/webhooks/clerk/route');
    const req = createRequest('{}'); // no svix headers
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('svix');
  });

  it('returns 400 when signature verification fails', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';

    vi.doMock('svix', () => ({
      Webhook: class MockWebhook {
        verify() {
          throw new Error('bad signature');
        }
      },
    }));

    const { POST } = await import('@/app/api/webhooks/clerk/route');
    const req = createRequest('{"type":"user.created"}', {
      'svix-id': 'msg_123',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,bad',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('signature');
  });

  it('returns 200 for verified user.created event', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';

    vi.doMock('svix', () => ({
      Webhook: class MockWebhook {
        verify() {
          return { type: 'user.created', data: { id: 'user_abc' } };
        }
      },
    }));

    const { POST } = await import('@/app/api/webhooks/clerk/route');
    const req = createRequest('{}', {
      'svix-id': 'msg_123',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,valid',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it('returns 200 for verified user.deleted event', async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';

    vi.doMock('svix', () => ({
      Webhook: class MockWebhook {
        verify() {
          return { type: 'user.deleted', data: { id: 'user_abc' } };
        }
      },
    }));

    const { POST } = await import('@/app/api/webhooks/clerk/route');
    const req = createRequest('{}', {
      'svix-id': 'msg_123',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,valid',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });
});
