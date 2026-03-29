import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

// Mock savedVehicles DB layer
const mockSaveVehicle = vi.fn();
const mockUnsaveVehicle = vi.fn();
const mockIsVehicleSaved = vi.fn();
vi.mock('@/lib/auth/savedVehicles', () => ({
  saveVehicle: (...args: unknown[]) => mockSaveVehicle(...args),
  unsaveVehicle: (...args: unknown[]) => mockUnsaveVehicle(...args),
  isVehicleSaved: (...args: unknown[]) => mockIsVehicleSaved(...args),
}));

function createRequest(
  method: string,
  body?: unknown,
  searchParams?: Record<string, string>,
) {
  const url = new URL('http://localhost/api/saved-vehicles');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return {
    method,
    nextUrl: url,
    json: () => Promise.resolve(body),
  };
}

describe('API — /api/saved-vehicles', () => {
  beforeEach(() => {
    vi.resetModules();
    mockAuth.mockReset();
    mockSaveVehicle.mockReset();
    mockUnsaveVehicle.mockReset();
    mockIsVehicleSaved.mockReset();
  });

  // -----------------------------------------------------------------------
  // GET
  // -----------------------------------------------------------------------
  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });
      const { GET } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('GET', undefined, { vehicleId: 'v-1' });
      const res = await GET(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 400 when vehicleId is missing', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      const { GET } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('GET');
      const res = await GET(req as any);
      expect(res.status).toBe(400);
    });

    it('returns { saved: true } when vehicle is saved', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockIsVehicleSaved.mockResolvedValue(true);
      const { GET } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('GET', undefined, { vehicleId: 'v-1' });
      const res = await GET(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.saved).toBe(true);
    });

    it('returns { saved: false } when vehicle is not saved', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockIsVehicleSaved.mockResolvedValue(false);
      const { GET } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('GET', undefined, { vehicleId: 'v-1' });
      const res = await GET(req as any);
      const body = await res.json();
      expect(body.saved).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // POST
  // -----------------------------------------------------------------------
  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });
      const { POST } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('POST', { vehicleId: 'v-1', vehicleSlug: 'slug' });
      const res = await POST(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid payload', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      const { POST } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('POST', { vehicleId: '' }); // missing vehicleSlug
      const res = await POST(req as any);
      expect(res.status).toBe(400);
    });

    it('returns 201 on successful save', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockSaveVehicle.mockResolvedValue({ ok: true });
      const { POST } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('POST', { vehicleId: 'v-1', vehicleSlug: 'test-slug' });
      const res = await POST(req as any);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.saved).toBe(true);
    });

    it('returns 500 when save fails', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockSaveVehicle.mockResolvedValue({ ok: false });
      const { POST } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('POST', { vehicleId: 'v-1', vehicleSlug: 'test-slug' });
      const res = await POST(req as any);
      expect(res.status).toBe(500);
    });

    it('passes correct params to saveVehicle', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockSaveVehicle.mockResolvedValue({ ok: true });
      const { POST } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('POST', { vehicleId: 'v-1', vehicleSlug: 'test-slug' });
      await POST(req as any);
      expect(mockSaveVehicle).toHaveBeenCalledWith('user_1', 'v-1', 'test-slug');
    });
  });

  // -----------------------------------------------------------------------
  // DELETE
  // -----------------------------------------------------------------------
  describe('DELETE', () => {
    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });
      const { DELETE } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('DELETE', undefined, { vehicleId: 'v-1' });
      const res = await DELETE(req as any);
      expect(res.status).toBe(401);
    });

    it('returns 400 when vehicleId is missing', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      const { DELETE } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('DELETE');
      const res = await DELETE(req as any);
      expect(res.status).toBe(400);
    });

    it('returns 200 on successful unsave', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_1' });
      mockUnsaveVehicle.mockResolvedValue({ ok: true });
      const { DELETE } = await import('@/app/api/saved-vehicles/route');
      const req = createRequest('DELETE', undefined, { vehicleId: 'v-1' });
      const res = await DELETE(req as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.saved).toBe(false);
    });
  });
});
