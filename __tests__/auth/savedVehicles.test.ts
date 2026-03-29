import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = { ...process.env };

describe('Saved Vehicles DB layer', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Graceful fallback when DATABASE_URL is not set
  // -------------------------------------------------------------------------
  describe('when DATABASE_URL is not set', () => {
    beforeEach(() => {
      delete process.env.DATABASE_URL;
    });

    it('getSavedVehicles returns empty array', async () => {
      const { getSavedVehicles } = await import('@/lib/auth/savedVehicles');
      const result = await getSavedVehicles('user_123');
      expect(result).toEqual([]);
    });

    it('isVehicleSaved returns false', async () => {
      const { isVehicleSaved } = await import('@/lib/auth/savedVehicles');
      const result = await isVehicleSaved('user_123', 'v-1');
      expect(result).toBe(false);
    });

    it('saveVehicle returns { ok: false }', async () => {
      const { saveVehicle } = await import('@/lib/auth/savedVehicles');
      const result = await saveVehicle('user_123', 'v-1', 'slug');
      expect(result).toEqual({ ok: false });
    });

    it('unsaveVehicle returns { ok: false }', async () => {
      const { unsaveVehicle } = await import('@/lib/auth/savedVehicles');
      const result = await unsaveVehicle('user_123', 'v-1');
      expect(result).toEqual({ ok: false });
    });
  });

  // -------------------------------------------------------------------------
  // With DATABASE_URL set — mock the neon driver
  // -------------------------------------------------------------------------
  describe('when DATABASE_URL is set', () => {
    let mockQuery: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      process.env.DATABASE_URL = 'postgres://mock:mock@mock/mock';
      mockQuery = vi.fn().mockResolvedValue([]);

      const mockNeon = vi.fn().mockReturnValue(Object.assign(
        vi.fn(),
        { query: mockQuery },
      ));

      vi.doMock('@neondatabase/serverless', () => ({
        neon: mockNeon,
      }));
    });

    it('getSavedVehicles returns mapped records', async () => {
      mockQuery.mockResolvedValueOnce([
        {
          clerk_user_id: 'user_1',
          vehicle_id: 'v-1',
          vehicle_slug: 'test-slug',
          saved_at: '2026-03-01T00:00:00Z',
        },
      ]);

      const { getSavedVehicles } = await import('@/lib/auth/savedVehicles');
      const result = await getSavedVehicles('user_1');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        clerkUserId: 'user_1',
        vehicleId: 'v-1',
        vehicleSlug: 'test-slug',
        savedAt: '2026-03-01T00:00:00Z',
      });
    });

    it('getSavedVehicles passes clerkUserId as param', async () => {
      mockQuery.mockResolvedValueOnce([]);
      const { getSavedVehicles } = await import('@/lib/auth/savedVehicles');
      await getSavedVehicles('user_abc');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('clerk_user_id = $1'),
        ['user_abc'],
      );
    });

    it('isVehicleSaved returns true when row exists', async () => {
      mockQuery.mockResolvedValueOnce([{ '?column?': 1 }]);
      const { isVehicleSaved } = await import('@/lib/auth/savedVehicles');
      const result = await isVehicleSaved('user_1', 'v-1');
      expect(result).toBe(true);
    });

    it('isVehicleSaved returns false when no row', async () => {
      mockQuery.mockResolvedValueOnce([]);
      const { isVehicleSaved } = await import('@/lib/auth/savedVehicles');
      const result = await isVehicleSaved('user_1', 'v-999');
      expect(result).toBe(false);
    });

    it('saveVehicle uses ON CONFLICT DO NOTHING (idempotent)', async () => {
      mockQuery.mockResolvedValueOnce([]);
      const { saveVehicle } = await import('@/lib/auth/savedVehicles');
      const result = await saveVehicle('user_1', 'v-1', 'test-slug');
      expect(result).toEqual({ ok: true });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        ['user_1', 'v-1', 'test-slug'],
      );
    });

    it('unsaveVehicle issues DELETE with correct params', async () => {
      mockQuery.mockResolvedValueOnce([]);
      const { unsaveVehicle } = await import('@/lib/auth/savedVehicles');
      const result = await unsaveVehicle('user_1', 'v-1');
      expect(result).toEqual({ ok: true });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM saved_vehicles'),
        ['user_1', 'v-1'],
      );
    });

    it('getSavedVehicles returns empty array on query error', async () => {
      mockQuery.mockRejectedValueOnce(new Error('connection failed'));
      const { getSavedVehicles } = await import('@/lib/auth/savedVehicles');
      const result = await getSavedVehicles('user_1');
      expect(result).toEqual([]);
    });

    it('saveVehicle returns { ok: false } on query error', async () => {
      mockQuery.mockRejectedValueOnce(new Error('constraint violation'));
      const { saveVehicle } = await import('@/lib/auth/savedVehicles');
      const result = await saveVehicle('user_1', 'v-1', 'slug');
      expect(result).toEqual({ ok: false });
    });
  });
});
