import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = { ...process.env };

describe('Redis Vehicle Views', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Graceful fallback when Redis is not configured
  // -------------------------------------------------------------------------
  describe('when Redis is not configured', () => {
    beforeEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it('recordVehicleView returns void without error', async () => {
      const { recordVehicleView } = await import('@/lib/redis/vehicleViews');
      await expect(recordVehicleView('v-1', 'session-abc')).resolves.toBeUndefined();
    });

    it('getVehicleViewCount returns 0 with empty label', async () => {
      const { getVehicleViewCount } = await import('@/lib/redis/vehicleViews');
      const result = await getVehicleViewCount('v-1');
      expect(result).toEqual({
        vehicleId: 'v-1',
        viewCount24h: 0,
        displayLabel: '',
      });
    });
  });

  // -------------------------------------------------------------------------
  // With Redis configured — mock the Redis client
  // -------------------------------------------------------------------------
  describe('when Redis is configured', () => {
    let mockZadd: ReturnType<typeof vi.fn>;
    let mockZcard: ReturnType<typeof vi.fn>;
    let mockZremrangebyscore: ReturnType<typeof vi.fn>;
    let mockExpire: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'token';

      mockZadd = vi.fn().mockResolvedValue(1);
      mockZcard = vi.fn().mockResolvedValue(0);
      mockZremrangebyscore = vi.fn().mockResolvedValue(0);
      mockExpire = vi.fn().mockResolvedValue(1);

      // The module uses `await import('@upstash/redis')` so we mock the module
      vi.doMock('@upstash/redis', () => ({
        Redis: class MockRedis {
          zadd = mockZadd;
          zcard = mockZcard;
          zremrangebyscore = mockZremrangebyscore;
          expire = mockExpire;
        },
      }));
    });

    it('recordVehicleView calls zadd with hashed token', async () => {
      const { recordVehicleView } = await import('@/lib/redis/vehicleViews');
      await recordVehicleView('v-1', 'session-token-123');

      expect(mockZremrangebyscore).toHaveBeenCalledTimes(1);
      expect(mockZadd).toHaveBeenCalledTimes(1);
      expect(mockExpire).toHaveBeenCalledTimes(1);

      // Verify the key format
      const zaddKey = mockZadd.mock.calls[0][0];
      expect(zaddKey).toBe('vehicle_views:v-1');

      // Verify the member is a SHA-256 hex hash (64 chars)
      const member = mockZadd.mock.calls[0][1].member;
      expect(member).toMatch(/^[a-f0-9]{64}$/);
    });

    it('recordVehicleView hashes token deterministically', async () => {
      const { recordVehicleView } = await import('@/lib/redis/vehicleViews');
      await recordVehicleView('v-1', 'same-token');
      const hash1 = mockZadd.mock.calls[0][1].member;

      mockZadd.mockClear();
      await recordVehicleView('v-1', 'same-token');
      const hash2 = mockZadd.mock.calls[0][1].member;

      expect(hash1).toBe(hash2);
    });

    it('recordVehicleView produces different hashes for different tokens', async () => {
      const { recordVehicleView } = await import('@/lib/redis/vehicleViews');
      await recordVehicleView('v-1', 'token-a');
      const hashA = mockZadd.mock.calls[0][1].member;

      mockZadd.mockClear();
      await recordVehicleView('v-1', 'token-b');
      const hashB = mockZadd.mock.calls[0][1].member;

      expect(hashA).not.toBe(hashB);
    });

    it('getVehicleViewCount returns count with singular label', async () => {
      mockZcard.mockResolvedValueOnce(1);
      const { getVehicleViewCount } = await import('@/lib/redis/vehicleViews');
      const result = await getVehicleViewCount('v-1');
      expect(result.viewCount24h).toBe(1);
      expect(result.displayLabel).toBe('1 person viewed this in the past 24 hours');
    });

    it('getVehicleViewCount returns count with plural label', async () => {
      mockZcard.mockResolvedValueOnce(42);
      const { getVehicleViewCount } = await import('@/lib/redis/vehicleViews');
      const result = await getVehicleViewCount('v-1');
      expect(result.viewCount24h).toBe(42);
      expect(result.displayLabel).toBe('42 people viewed this in the past 24 hours');
    });

    it('getVehicleViewCount returns empty label when count is 0', async () => {
      mockZcard.mockResolvedValueOnce(0);
      const { getVehicleViewCount } = await import('@/lib/redis/vehicleViews');
      const result = await getVehicleViewCount('v-1');
      expect(result.viewCount24h).toBe(0);
      expect(result.displayLabel).toBe('');
    });

    it('display label never uses fake urgency language', async () => {
      mockZcard.mockResolvedValueOnce(15);
      const { getVehicleViewCount } = await import('@/lib/redis/vehicleViews');
      const result = await getVehicleViewCount('v-1');
      expect(result.displayLabel).not.toContain('viewing now');
      expect(result.displayLabel).not.toContain('right now');
      expect(result.displayLabel).toContain('in the past 24 hours');
    });

    it('expire is set to 25 hours (90000 seconds)', async () => {
      const { recordVehicleView } = await import('@/lib/redis/vehicleViews');
      await recordVehicleView('v-1', 'token');
      const expireSeconds = mockExpire.mock.calls[0][1];
      expect(expireSeconds).toBe(24 * 60 * 60 + 3600); // 90000
    });
  });
});
