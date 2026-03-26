import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { saveVehicle, unsaveVehicle, isVehicleSaved } from '@/lib/auth/savedVehicles';

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vehicleId = req.nextUrl.searchParams.get('vehicleId');
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });
  }

  const saved = await isVehicleSaved(userId, vehicleId);
  return NextResponse.json({ saved });
}

/** POST /api/saved-vehicles — save a vehicle */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = SavePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await saveVehicle(userId, parsed.data.vehicleId, parsed.data.vehicleSlug);
  if (!result.ok) {
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }

  return NextResponse.json({ saved: true }, { status: 201 });
}

/** DELETE /api/saved-vehicles?vehicleId=xxx — remove a saved vehicle */
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vehicleId = req.nextUrl.searchParams.get('vehicleId');
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });
  }

  const result = await unsaveVehicle(userId, vehicleId);
  if (!result.ok) {
    return NextResponse.json({ error: 'Unsave failed' }, { status: 500 });
  }

  return NextResponse.json({ saved: false });
}
