/**
 * Redis-backed vehicle view tracking.
 *
 * Design rules:
 * - Uses Upstash Redis (HTTP-based, edge-compatible).
 * - Rolling 24-hour window using a Redis sorted set (ZADD / ZREMRANGEBYSCORE).
 * - Deduplication: each session token contributes at most one view per 24h.
 * - sessionToken is hashed before storage — raw session identifiers are never
 *   written to Redis. Callers must pass a short-lived anonymous token, not a
 *   Clerk userId, IP address, or any PII.
 * - Display label is honest: "X people viewed this in the past 24 hours".
 *   No fake "X people viewing now" claims.
 * - When Redis is not configured, all functions return safe empty responses.
 */

import type { VehicleViewCount } from '@/types/a5';

const WINDOW_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Returns the Upstash Redis client, or null if not configured.
 */
async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import('@upstash/redis');
  return new Redis({ url, token });
}

/**
 * Returns the Redis key for a vehicle's view sorted set.
 */
function viewsKey(vehicleId: string): string {
  return `vehicle_views:${vehicleId}`;
}

/**
 * Returns the current Unix timestamp in seconds.
 */
function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Hashes a session token to a fixed-length anonymous identifier.
 * The hash is one-way — the original token cannot be recovered.
 * Uses the Web Crypto API (available in Node.js 18+ and edge runtimes).
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Records a vehicle view for the given session token.
 * - Hashes the token before storage.
 * - Adds to a sorted set with the current timestamp as the score.
 * - Removes entries older than 24 hours.
 * - Idempotent within a 24-hour window: re-recording the same token does
 *   not inflate the count.
 */
export async function recordVehicleView(
  vehicleId: string,
  sessionToken: string,
): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  const now = nowSeconds();
  const key = viewsKey(vehicleId);
  const hashedToken = await hashToken(sessionToken);

  // Remove expired members (older than 24h) then add this view
  await redis.zremrangebyscore(key, 0, now - WINDOW_SECONDS);
  await redis.zadd(key, { score: now, member: hashedToken });
  // Expire the key 25h from now to self-clean
  await redis.expire(key, WINDOW_SECONDS + 3600);
}

/**
 * Returns the 24-hour view count and an honest display label.
 */
export async function getVehicleViewCount(
  vehicleId: string,
): Promise<VehicleViewCount> {
  const redis = await getRedis();
  if (!redis) {
    return { vehicleId, viewCount24h: 0, displayLabel: '' };
  }

  const now = nowSeconds();
  const key = viewsKey(vehicleId);

  // Remove stale before counting
  await redis.zremrangebyscore(key, 0, now - WINDOW_SECONDS);
  const count = await redis.zcard(key);

  return {
    vehicleId,
    viewCount24h: count,
    displayLabel: count > 0
      ? `${count} ${count === 1 ? 'person' : 'people'} viewed this in the past 24 hours`
      : '',
  };
}
