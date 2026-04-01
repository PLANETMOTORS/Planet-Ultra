import { NextRequest, NextResponse } from 'next/server';
import { beginWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/eventStore';
import { updatePurchaseByStripeSession } from '@/lib/purchase/lifecycleStore';

/**
 * POST /api/webhooks/stripe
 * Status: ACTIVE (signature verified) — event handling is partially stubbed
 *
 * Handled events:
 * - checkout.session.completed  — deposit confirmed; future: update vehicle
 *   status to 'reserved', dispatch CRM deposit event, notify dealership
 * - checkout.session.expired    — deposit expired; future: release hold
 *
 * All other events are acknowledged (200) and logged.
 */

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSignature = req.headers.get('stripe-signature');

  if (!secret) {
    console.error('[webhook/stripe] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!stripeSignature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const body = await req.text();

  let event: StripeEvent;
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    });
    event = stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      secret,
    ) as unknown as StripeEvent;
  } catch (err) {
    console.error('[webhook/stripe] Signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.info('[webhook/stripe] Event received', { type: event.type });

  const eventId = event.id;
  const eventStoreResult = await beginWebhookEvent({
    provider: 'stripe',
    eventId,
    eventType: event.type,
    payload: event.data.object,
  });

  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const vehicleId = (session['metadata'] as Record<string, string> | undefined)?.vehicleId;
        const clerkUserId = (session['metadata'] as Record<string, string> | undefined)?.clerkUserId;
        const stripeSessionId = typeof session['id'] === 'string' ? session['id'] : null;
        console.info('[webhook/stripe] Deposit completed', { vehicleId, clerkUserId });
        if (stripeSessionId) {
          await updatePurchaseByStripeSession({
            stripeSessionId,
            toStatus: 'paid',
            eventType: 'purchase.paid.stripe_webhook',
            payload: { eventType: event.type, vehicleId, clerkUserId },
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const vehicleId = (session['metadata'] as Record<string, string> | undefined)?.vehicleId;
        const stripeSessionId = typeof session['id'] === 'string' ? session['id'] : null;
        console.info('[webhook/stripe] Deposit session expired', { vehicleId });
        if (stripeSessionId) {
          await updatePurchaseByStripeSession({
            stripeSessionId,
            toStatus: 'expired',
            eventType: 'purchase.expired.stripe_webhook',
            payload: { eventType: event.type, vehicleId },
          });
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const stripeSessionId =
          typeof charge['metadata'] === 'object' && charge['metadata'] !== null
            ? (charge['metadata'] as Record<string, string>)['checkout_session_id'] ?? null
            : null;
        if (stripeSessionId) {
          await updatePurchaseByStripeSession({
            stripeSessionId,
            toStatus: 'refunded',
            eventType: 'purchase.refunded.stripe_webhook',
            payload: { eventType: event.type },
          });
        }
        break;
      }
      default:
        break;
    }
    await completeWebhookEvent({
      provider: 'stripe',
      eventId,
      success: true,
    });
  } catch (err) {
    await completeWebhookEvent({
      provider: 'stripe',
      eventId,
      success: false,
      errorMessage: (err as Error).message,
    });
    throw err;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
