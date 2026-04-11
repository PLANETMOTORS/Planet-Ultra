import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createDepositSession } from '@/lib/stripe/depositIntent';
import { dispatchCrmEventWithReceipt, buildDepositEvent } from '@/lib/crm/autoraptor';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { apiError, apiInternalError } from '@/lib/security/apiError';
import { writeAuditLog } from '@/lib/security/auditLog';
import { getInventoryVehicleByReference } from '@/lib/inventory/repository';
import {
  createPurchaseSubmission,
  markPurchaseCheckoutCreated,
} from '@/lib/purchase/lifecycleStore';

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
    return apiError(401, 'UNAUTHORIZED', 'Authentication required');
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
    return apiError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const parsed = PurchaseSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_FAILED', 'Invalid request payload');
  }

  const verifiedVehicle = await getInventoryVehicleByReference(
    parsed.data.vehicleId,
    parsed.data.vehicleSlug,
  );
  if (!verifiedVehicle || verifiedVehicle.status !== 'available') {
    return apiError(409, 'VEHICLE_UNAVAILABLE', 'Vehicle is unavailable or reference mismatch');
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

    const purchaseSubmissionId = await createPurchaseSubmission({
      clerkUserId: userId,
      vehicleId: verifiedVehicle.id,
      vehicleSlug: verifiedVehicle.slug,
      amountCents: result.amountCents,
      metadata: { source: 'api.purchase.submit' },
    });
    if (purchaseSubmissionId) {
      await markPurchaseCheckoutCreated({
        submissionId: purchaseSubmissionId,
        stripeSessionId: result.sessionId,
      });
    }

    // Dispatch CRM deposit event — fire-and-forget, non-blocking
    dispatchCrmEventWithReceipt('api.purchase.submit', buildDepositEvent({
      vehicleId: verifiedVehicle.id,
      vehicleSlug: verifiedVehicle.slug,
      vehicleYear: verifiedVehicle.year,
      vehicleMake: verifiedVehicle.make,
      vehicleModel: verifiedVehicle.model,
      clerkUserId: userId,
      meta: {
        sessionId: result.sessionId,
        amountCents: result.amountCents,
        purchaseSubmissionId: purchaseSubmissionId ?? 'untracked',
      },
    })).catch((err) => {
      console.error('[api/purchase/submit] CRM dispatch error:', (err as Error).message);
    });

    // PCI audit: log deposit initiation with non-sensitive identifiers only
    writeAuditLog({
      actor: userId,
      action: 'deposit.initiated',
      resource: verifiedVehicle.id,
      metadata: {
        vehicleSlug: verifiedVehicle.slug,
        amountCents: result.amountCents,
        stripeSessionId: result.sessionId,
        purchaseSubmissionId: purchaseSubmissionId ?? 'untracked',
      },
    }).catch(() => {
      // fire-and-forget — audit must never block the response
    });

    return NextResponse.json(
      { ...result, purchaseSubmissionId: purchaseSubmissionId ?? undefined },
      { status: 200 },
    );
  } catch (err) {
    return apiInternalError('api/purchase/submit', err);
  }
}
