import { NextRequest, NextResponse } from 'next/server';
import { beginWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/eventStore';

/**
 * POST /api/webhooks/autoraptor
 * Status: STUB / RESERVED
 *
 * AutoRaptor may send event callbacks (e.g. lead status updates).
 * This handler validates the shared secret and acknowledges receipt.
 * Full event handling is a future deliverable.
 */

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.AUTORAPTOR_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get('x-autoraptor-secret');

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 },
    );
  }

  if (receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const eventType = (body['type'] as string | undefined) ?? 'autoraptor.unknown';
  const eventId =
    req.headers.get('x-event-id') ??
    `${eventType}:${String(body['leadId'] ?? body['id'] ?? 'unknown')}`;

  const eventStoreResult = await beginWebhookEvent({
    provider: 'autoraptor',
    eventId,
    eventType,
    payload: body,
  });
  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  console.info('[webhook/autoraptor] Event received (stub)', { type: eventType });
  await completeWebhookEvent({
    provider: 'autoraptor',
    eventId,
    success: true,
  });
  return NextResponse.json({ received: true, status: 'stub' }, { status: 200 });
}
