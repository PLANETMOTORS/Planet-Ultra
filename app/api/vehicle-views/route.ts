import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordVehicleView, getVehicleViewCount } from '@/lib/redis/vehicleViews';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { apiError } from '@/lib/security/apiError';

/**
 * /api/vehicle-views
 *
 * GET  ?vehicleId=xxx  — returns the 24h view count and honest display label
 * POST               — records a view ingestion event
 *
 * Rules:
 * - No auth required — view tracking is public.
 * - sessionToken is provided by the client (an anonymous session identifier),
 *   hashed server-side before storage. PII is never stored.
 * - Display label is honest: "X people viewed this in the past 24 hours".
 * - No "X people viewing right now" language — no fake urgency.
 */

const IngestSchema = z.object({
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),
  /** Short-lived anonymous session token — hashed server-side before storage */
  sessionToken: z.string().min(8).max(512),
});

export async function GET(req: NextRequest) {
  const vehicleId = req.nextUrl.searchParams.get('vehicleId');
  if (!vehicleId) {
    return apiError(400, 'MISSING_PARAM', 'vehicleId is required');
  }

  const result = await getVehicleViewCount(vehicleId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_FAILED', 'Invalid request payload');
  }
  const rateDecision = await checkRateLimit(
    req,
    { name: 'vehicle_views_ingest', limit: 20, windowSeconds: 60 },
    { keySuffix: parsed.data.vehicleId },
  );
  if (!rateDecision.allowed) {
    return buildRateLimitedResponse(rateDecision);
  }

  await recordVehicleView(parsed.data.vehicleId, parsed.data.sessionToken);

  return NextResponse.json({ ok: true }, { status: 202 });
}
