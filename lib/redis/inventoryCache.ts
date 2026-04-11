/**
 * Upstash Redis cache for inventory catalog reads.
 *
 * Design rules:
 * - Cached inventory card data uses a 5-minute TTL, matching the ISR
 *   revalidate = 300 on the inventory page.
 * - Cache keys are namespaced: inventory:cards:{limit}
 * - Invalidation: the HomenetFeed importer calls bustInventoryCache()
 *   after a successful import run.
 * - When Redis is not configured, all functions fall through to the
 *   database transparently — caching is an optimization, not a requirement.
 * - Cached data is JSON-serialized. The caller is responsible for
 *   type safety (data is validated on read via shape check).
 */

const CACHE_TTL_SECONDS = 300; // 5 minutes — matches ISR revalidate
const KEY_PREFIX = 'inventory:cards';

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import('@upstash/redis');
  return new Redis({ url, token });
}

function cacheKey(limit: number): string {
  return `${KEY_PREFIX}:${limit}`;
}

/**
 * Attempts to read cached inventory cards from Redis.
 * Returns null on miss or when Redis is unavailable.
 */
export async function getCachedInventoryCards<T>(limit: number): Promise<T[] | null> {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get<string>(cacheKey(limit));
    if (!raw) return null;

    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return null;

    return parsed as T[];
  } catch {
    return null;
  }
}

/**
 * Writes inventory cards to Redis with the standard TTL.
 */
export async function setCachedInventoryCards<T>(limit: number, data: T[]): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    await redis.set(cacheKey(limit), JSON.stringify(data), { ex: CACHE_TTL_SECONDS });
  } catch {
    // Cache write failure is non-fatal
  }
}

/**
 * Busts all inventory cache entries.
 * Call this after a successful HomenetFeed import run.
 */
export async function bustInventoryCache(): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    // Remove common limit variants
    const commonLimits = [60, 120, 240];
    await Promise.all(commonLimits.map((limit) => redis.del(cacheKey(limit))));
  } catch {
    // Cache bust failure is non-fatal
  }
}
