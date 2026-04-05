import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitPolicy {
  name: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  policy: string;
  key: string;
}

export function extractClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

export function buildRateLimitKey(
  policy: RateLimitPolicy,
  identifier: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const bucket = Math.floor(nowSeconds / policy.windowSeconds);
  return `rate_limit:${policy.name}:${identifier}:${bucket}`;
}

export function buildRateLimitedResponse(decision: RateLimitDecision): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Too Many Requests',
      code: 'RATE_LIMITED',
      policy: decision.policy,
      retryAfterSeconds: decision.retryAfterSeconds,
    },
    { status: 429 },
  );

  response.headers.set('Retry-After', String(decision.retryAfterSeconds));
  response.headers.set('X-RateLimit-Limit', String(decision.limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, decision.remaining)));
  response.headers.set('X-RateLimit-Policy', decision.policy);
  return response;
}

export async function checkRateLimit(
  req: NextRequest,
  policy: RateLimitPolicy,
  opts?: { userId?: string | null; keySuffix?: string | null },
): Promise<RateLimitDecision> {
  const now = Math.floor(Date.now() / 1000);
  const retryAfterSeconds = policy.windowSeconds - (now % policy.windowSeconds || policy.windowSeconds);

  const identifier = opts?.userId
    ? `user:${opts.userId}`
    : `ip:${extractClientIp(req)}`;

  const suffix = opts?.keySuffix ? `:${opts.keySuffix}` : '';
  const key = `${buildRateLimitKey(policy, identifier, now)}${suffix}`;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return {
      allowed: true,
      limit: policy.limit,
      remaining: policy.limit,
      retryAfterSeconds: 0,
      policy: policy.name,
      key,
    };
  }

  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({ url, token });

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, policy.windowSeconds);
  }

  return {
    allowed: count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    retryAfterSeconds,
    policy: policy.name,
    key,
  };
}

