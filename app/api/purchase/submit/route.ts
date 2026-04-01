import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createDepositSession } from '@/lib/stripe/depositIntent';
import { dispatchCrmEventWithReceipt, buildDepositEvent } from '@/lib/crm/autoraptor';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { getInventoryVehicleByReference } from '@/lib/inventory/repository';

/**
 * POST /api/purchase/submit
 *
 * Server boundary for the Stripe deposit/purchase flow.
 *
 * Rules:
 * - Requires Clerk auth. Unauthenticated → 401.
 * - clerkUserId is resolved server-side from the session. It is NOT read
 *   from the client payload.
 * - Vehicle facts (year/make/model/price) are resolved from inventory DB.
 *   Client-supplied values are not used as source-of-truth.
 * - Actual deposit amount is controlled by STRIPE_DEPOSIT_AMOUNT_CENTS env var.
 * - No Stripe secret key is ever exposed to the browser.
 * - Returns a Stripe Checkout session ID for client redirect.
 */

const PurchaseSubmitSchema = z.object({
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  // Auth check — clerkUserId resolved server-side only
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rateDecision = await checkRateLimit(
    req,
    { name: 'purchase_submit', limit: 5, windowSeconds: 60 },
    { userId },
  );
  if (!rateDecision.allowed) {
    return buildRateLimitedResponse(rateDecision);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PurchaseSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const verifiedVehicle = await getInventoryVehicleByReference(
    parsed.data.vehicleId,
    parsed.data.vehicleSlug,
  );
  if (!verifiedVehicle || verifiedVehicle.status !== 'available') {
    return NextResponse.json(
      { error: 'Vehicle unavailable or reference mismatch' },
      { status: 409 },
    );
  }

  try {
    const result = await createDepositSession({
      vehicleId: verifiedVehicle.id,
      vehicleSlug: verifiedVehicle.slug,
      vehicleMake: verifiedVehicle.make,
      vehicleModel: verifiedVehicle.model,
      vehicleYear: verifiedVehicle.year,
      vehiclePriceCad: verifiedVehicle.priceCad,
      clerkUserId: userId,
    });

    // Dispatch CRM deposit event — fire-and-forget, non-blocking
    dispatchCrmEventWithReceipt('api.purchase.submit', buildDepositEvent({
      vehicleId: verifiedVehicle.id,
      vehicleSlug: verifiedVehicle.slug,
      vehicleYear: verifiedVehicle.year,
      vehicleMake: verifiedVehicle.make,
      vehicleModel: verifiedVehicle.model,
      clerkUserId: userId,
      meta: { sessionId: result.sessionId, amountCents: result.amountCents },
    })).catch((err) => {
      console.error('[api/purchase/submit] CRM dispatch error:', (err as Error).message);
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[api/purchase/submit] Error creating deposit session:', err);
    return NextResponse.json(
      { error: 'Failed to create deposit session' },
      { status: 500 },
    );
  }
}
