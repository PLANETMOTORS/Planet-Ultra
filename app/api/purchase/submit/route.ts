import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createDepositSession } from '@/lib/stripe/depositIntent';
import { dispatchCrmEvent, buildDepositEvent } from '@/lib/crm/autoraptor';

/**
 * POST /api/purchase/submit
 *
 * Server boundary for the Stripe deposit/purchase flow.
 *
 * Rules:
 * - Requires Clerk auth. Unauthenticated → 401.
 * - clerkUserId is resolved server-side from the session. It is NOT read
 *   from the client payload.
 * - Vehicle price is passed in for metadata/display only — the actual
 *   deposit amount is controlled by STRIPE_DEPOSIT_AMOUNT_CENTS env var.
 * - No Stripe secret key is ever exposed to the browser.
 * - Returns a Stripe Checkout session ID for client redirect.
 */

const PurchaseSubmitSchema = z.object({
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),
  vehicleMake: z.string().min(1).max(100),
  vehicleModel: z.string().min(1).max(100),
  vehicleYear: z.number().int().min(1900).max(2100),
  vehiclePriceCad: z.number().positive(),
});

export async function POST(req: NextRequest) {
  // Auth check — clerkUserId resolved server-side only
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

  const parsed = PurchaseSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await createDepositSession({
      ...parsed.data,
      clerkUserId: userId,
    });

    // Dispatch CRM deposit event — fire-and-forget, non-blocking
    dispatchCrmEvent(buildDepositEvent({
      vehicleId: parsed.data.vehicleId,
      vehicleSlug: parsed.data.vehicleSlug,
      vehicleYear: parsed.data.vehicleYear,
      vehicleMake: parsed.data.vehicleMake,
      vehicleModel: parsed.data.vehicleModel,
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
