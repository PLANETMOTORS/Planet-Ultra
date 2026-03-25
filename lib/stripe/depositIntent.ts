/**
 * Stripe deposit intent server boundary.
 *
 * Rules enforced here:
 * - All Stripe operations are server-side only. No Stripe secret key in browser.
 * - The deposit amount comes from the env var STRIPE_DEPOSIT_AMOUNT_CENTS, not
 *   from the client payload.
 * - Vehicle price is passed through for display/metadata only — no pricing logic
 *   runs in this layer.
 * - The Stripe Checkout Session is created server-side and only the session ID
 *   is returned to the client for redirect.
 */

import type { DepositIntentRequest, DepositIntentResult } from '@/types/a5';

const DEPOSIT_ENABLED = process.env.ENABLE_STRIPE_DEPOSITS === '1';
const DEPOSIT_AMOUNT_CENTS = parseInt(
  process.env.STRIPE_DEPOSIT_AMOUNT_CENTS ?? '50000',
  10,
);

/**
 * Creates a Stripe Checkout Session for a vehicle deposit.
 * Returns the session ID and publishable key for client-side redirect.
 *
 * When ENABLE_STRIPE_DEPOSITS is not '1', returns a feature-flagged stub
 * response so the purchase flow can be exercised without a live Stripe key.
 */
export async function createDepositSession(
  request: DepositIntentRequest,
): Promise<DepositIntentResult> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

  if (!DEPOSIT_ENABLED) {
    // Feature flag off — return a clearly-labeled stub session
    console.info(
      `[stripe/deposit] ENABLE_STRIPE_DEPOSITS is off — returning stub for vehicleId=${request.vehicleId}`,
    );
    return {
      sessionId: `stub_session_${request.vehicleId}`,
      publishableKey,
      vehicleId: request.vehicleId,
      amountCents: DEPOSIT_AMOUNT_CENTS,
    };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('[stripe/deposit] STRIPE_SECRET_KEY is not configured');
  }

  // Dynamic import keeps Stripe out of the module graph on builds where the
  // package is not installed or the key is not present.
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.planetmotors.app';
  const canonicalVdpUrl = `${siteUrl}/inventory/used/${encodeURIComponent(
    request.vehicleMake.toLowerCase(),
  )}/${encodeURIComponent(request.vehicleModel.toLowerCase())}/${request.vehicleSlug}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: `${request.vehicleYear} ${request.vehicleMake} ${request.vehicleModel} — Deposit`,
            description: `Refundable deposit to hold vehicle ${request.vehicleSlug}`,
          },
          unit_amount: DEPOSIT_AMOUNT_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: {
      vehicleId: request.vehicleId,
      vehicleSlug: request.vehicleSlug,
      clerkUserId: request.clerkUserId,
    },
    success_url: `${canonicalVdpUrl}?deposit=success`,
    cancel_url: `${canonicalVdpUrl}?deposit=cancelled`,
  });

  return {
    sessionId: session.id,
    publishableKey,
    vehicleId: request.vehicleId,
    amountCents: DEPOSIT_AMOUNT_CENTS,
  };
}
