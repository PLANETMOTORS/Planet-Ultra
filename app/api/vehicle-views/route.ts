import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recordVehicleView, getVehicleViewCount } from '@/lib/redis/vehicleViews';

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
    return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });
  }

  const result = await getVehicleViewCount(vehicleId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  await recordVehicleView(parsed.data.vehicleId, parsed.data.sessionToken);

  return NextResponse.json({ ok: true }, { status: 202 });
}
