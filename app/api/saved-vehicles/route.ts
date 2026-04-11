import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { saveVehicle, unsaveVehicle, isVehicleSaved } from '@/lib/auth/savedVehicles';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { apiError } from '@/lib/security/apiError';

/**
 * /api/saved-vehicles
 *
 * All methods require a valid Clerk session. Unauthenticated requests → 401.
 * vehicleId and vehicleSlug come from the client; they are validated but the
 * vehicle facts (make, model, year) remain sourced from Postgres on read.
 */

const SavePayload = z.object({
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),
});

/** GET /api/saved-vehicles?vehicleId=xxx — check if a vehicle is saved */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return apiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const vehicleId = req.nextUrl.searchParams.get('vehicleId');
  if (!vehicleId) {
    return apiError(400, 'MISSING_PARAM', 'vehicleId is required');
  }

  const saved = await isVehicleSaved(userId, vehicleId);
  return NextResponse.json({ saved });
}

/** POST /api/saved-vehicles — save a vehicle */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return apiError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  const rateDecision = await checkRateLimit(
    req,
    { name: 'saved_vehicles_write', limit: 30, windowSeconds: 60 },
    { userId },
  );
  if (!rateDecision.allowed) {
    return buildRateLimitedResponse(rateDecision);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const parsed = SavePayload.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_FAILED', 'Invalid request payload');
  }

  const result = await saveVehicle(userId, parsed.data.vehicleId, parsed.data.vehicleSlug);
  if (!result.ok) {
    return apiError(500, 'SAVE_FAILED', 'Failed to save vehicle', { retryable: true });
  }

  return NextResponse.json({ saved: true }, { status: 201 });
}

/** DELETE /api/saved-vehicles?vehicleId=xxx — remove a saved vehicle */
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return apiError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  const rateDecision = await checkRateLimit(
    req,
    { name: 'saved_vehicles_write', limit: 30, windowSeconds: 60 },
    { userId },
  );
  if (!rateDecision.allowed) {
    return buildRateLimitedResponse(rateDecision);
  }

  const vehicleId = req.nextUrl.searchParams.get('vehicleId');
  if (!vehicleId) {
    return apiError(400, 'MISSING_PARAM', 'vehicleId is required');
  }

  const result = await unsaveVehicle(userId, vehicleId);
  if (!result.ok) {
    return apiError(500, 'UNSAVE_FAILED', 'Failed to remove saved vehicle', { retryable: true });
  }

  return NextResponse.json({ saved: false });
}
