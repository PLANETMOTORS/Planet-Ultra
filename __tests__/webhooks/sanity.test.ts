import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/cache revalidatePath
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

// Mock NextRequest/NextResponse
function createRequest(body: unknown, headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
    json: () => Promise.resolve(body),
  };
}

const originalEnv = { ...process.env };

describe('Sanity Webhook — /api/webhooks/sanity', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.REVALIDATE_SECRET = 'test-secret-123';
    mockRevalidatePath.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects request when REVALIDATE_SECRET is not set', async () => {
    delete process.env.REVALIDATE_SECRET;
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest({ _type: 'homePage' }, { 'x-revalidate-secret': 'anything' });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('rejects request when secret does not match', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest({ _type: 'homePage' }, { 'x-revalidate-secret': 'wrong-secret' });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 200 and revalidates / for siteSettings', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'siteSettings' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });

  it('revalidates / for navigation', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'navigation' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    await POST(req as any);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });

  it('revalidates / for footer', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'footer' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    await POST(req as any);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });

  it('revalidates / for homePage', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'homePage' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    await POST(req as any);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });

  it('revalidates /inventory and /sitemap.xml for vehicle', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'vehicle' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    await POST(req as any);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/inventory');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/sitemap.xml');
  });

  it('does not revalidate for unknown doc types', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'blogPost' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('returns revalidated:true and docType in body', async () => {
    const { POST } = await import('@/app/api/webhooks/sanity/route');
    const req = createRequest(
      { _type: 'homePage' },
      { 'x-revalidate-secret': 'test-secret-123' },
    );
    const res = await POST(req as any);
    const body = await res.json();
    expect(body.revalidated).toBe(true);
    expect(body.docType).toBe('homePage');
  });
});
