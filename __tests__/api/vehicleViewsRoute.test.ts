import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock vehicle views
const mockRecordVehicleView = vi.fn();
const mockGetVehicleViewCount = vi.fn();
vi.mock('@/lib/redis/vehicleViews', () => ({
  recordVehicleView: (...args: unknown[]) => mockRecordVehicleView(...args),
  getVehicleViewCount: (...args: unknown[]) => mockGetVehicleViewCount(...args),
}));

function createGetRequest(searchParams?: Record<string, string>) {
  const url = new URL('http://localhost/api/vehicle-views');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return { nextUrl: url };
}

function createPostRequest(body?: unknown) {
  return {
    json: () => Promise.resolve(body),
  };
}

describe('API — /api/vehicle-views', () => {
  beforeEach(() => {
    vi.resetModules();
    mockRecordVehicleView.mockReset();
    mockGetVehicleViewCount.mockReset();
  });

  // -----------------------------------------------------------------------
  // GET
  // -----------------------------------------------------------------------
  describe('GET', () => {
    it('returns 400 when vehicleId is missing', async () => {
      const { GET } = await import('@/app/api/vehicle-views/route');
      const req = createGetRequest();
      const res = await GET(req as any);
      expect(res.status).toBe(400);
    });

    it('returns view count for valid vehicleId', async () => {
      mockGetVehicleViewCount.mockResolvedValue({
        vehicleId: 'v-1',
        viewCount24h: 10,
        displayLabel: '10 people viewed this in the past 24 hours',
      });
      const { GET } = await import('@/app/api/vehicle-views/route');
      const req = createGetRequest({ vehicleId: 'v-1' });
      const res = await GET(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.viewCount24h).toBe(10);
      expect(body.displayLabel).toContain('10 people');
    });
  });

  // -----------------------------------------------------------------------
  // POST
  // -----------------------------------------------------------------------
  describe('POST', () => {
    it('returns 400 for invalid JSON', async () => {
      const { POST } = await import('@/app/api/vehicle-views/route');
      const req = { json: () => Promise.reject(new Error('parse error')) };
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid payload (missing fields)', async () => {
      const { POST } = await import('@/app/api/vehicle-views/route');
      const req = createPostRequest({ vehicleId: 'v-1' }); // missing vehicleSlug + sessionToken
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for short sessionToken (< 8 chars)', async () => {
      const { POST } = await import('@/app/api/vehicle-views/route');
      const req = createPostRequest({
        vehicleId: 'v-1',
        vehicleSlug: 'slug',
        sessionToken: 'short',
      });
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it('returns 202 for valid ingestion', async () => {
      mockRecordVehicleView.mockResolvedValue(undefined);
      const { POST } = await import('@/app/api/vehicle-views/route');
      const req = createPostRequest({
        vehicleId: 'v-1',
        vehicleSlug: '2024-toyota-camry',
        sessionToken: 'abcdefgh12345678',
      });
      const res = await POST(req as any);
      expect(res.status).toBe(202);
      const body = await res.json();
      expect(body.ok).toBe(true);
    });

    it('calls recordVehicleView with correct args', async () => {
      mockRecordVehicleView.mockResolvedValue(undefined);
      const { POST } = await import('@/app/api/vehicle-views/route');
      const req = createPostRequest({
        vehicleId: 'v-1',
        vehicleSlug: 'slug',
        sessionToken: 'my-session-token',
      });
      await POST(req as any);
      expect(mockRecordVehicleView).toHaveBeenCalledWith('v-1', 'my-session-token');
    });
  });
});
