import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { beginWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/eventStore';

/**
 * POST /api/webhooks/clerk
 * Status: ACTIVE
 *
 * Handles Clerk webhook events. All events are verified using the svix
 * signature before processing. Unverified requests → 400.
 *
 * Handled events:
 * - user.created  — future: create a user record in Postgres if needed
 * - user.deleted  — future: cascade-delete saved vehicles for the user
 *
 * All other events are acknowledged (200) and logged at debug level.
 */

interface ClerkWebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook/clerk] CLERK_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.info('[webhook/clerk] Event received', { type: event.type });

  const eventStoreResult = await beginWebhookEvent({
    provider: 'clerk',
    eventId: svixId,
    eventType: event.type,
    payload: event.data,
  });

  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'user.created':
        // Future: initialize user record in Postgres
        break;
      case 'user.deleted':
        // Future: cascade-delete saved_vehicles for this user
        break;
      default:
        break;
    }
    await completeWebhookEvent({
      provider: 'clerk',
      eventId: svixId,
      success: true,
    });
  } catch (err) {
    await completeWebhookEvent({
      provider: 'clerk',
      eventId: svixId,
      success: false,
      errorMessage: (err as Error).message,
    });
    throw err;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
