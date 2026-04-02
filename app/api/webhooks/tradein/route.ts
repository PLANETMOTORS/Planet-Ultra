import { NextRequest, NextResponse } from 'next/server';
import { beginWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/eventStore';
import { updateTradeInByExternalReference } from '@/lib/tradein/lifecycleStore';
import type { TradeInLifecycleStatus } from '@/types/a5';

function resolveTradeInStatus(eventType: string): TradeInLifecycleStatus | null {
  switch (eventType) {
    case 'tradein.inspected':
      return 'inspected';
    case 'tradein.completed':
      return 'completed';
    case 'tradein.declined':
      return 'declined';
    case 'tradein.withdrawn':
      return 'withdrawn';
    case 'tradein.expired':
      return 'expired';
    default:
      return null;
  }
}

/**
 * POST /api/webhooks/tradein
 *
 * Provider lifecycle callback for trade-in status updates.
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.TRADEIN_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get('x-tradein-secret');
  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventId = String(body.eventId ?? body.id ?? '');
  const eventType = String(body.eventType ?? body.type ?? 'tradein.unknown');
  const externalReference = String(body.externalReference ?? '');

  if (!eventId || !externalReference) {
    return NextResponse.json(
      { error: 'Missing required fields: eventId, externalReference' },
      { status: 400 },
    );
  }

  const eventStoreResult = await beginWebhookEvent({
    provider: 'tradein',
    eventId,
    eventType,
    payload: body,
  });
  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    const status = resolveTradeInStatus(eventType);
    if (!status) {
      await completeWebhookEvent({
        provider: 'tradein',
        eventId,
        success: true,
      });
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const submissionId = await updateTradeInByExternalReference({
      externalReference,
      toStatus: status,
      eventType: `tradein.webhook.${eventType}`,
      payload: { eventType, externalReference },
    });
    if (!submissionId) {
      await completeWebhookEvent({
        provider: 'tradein',
        eventId,
        success: false,
        errorMessage: 'tradein_submission_not_found',
      });
      return NextResponse.json({ error: 'Trade-in submission not found' }, { status: 404 });
    }

    await completeWebhookEvent({
      provider: 'tradein',
      eventId,
      success: true,
    });
    return NextResponse.json({ received: true, status }, { status: 200 });
  } catch (err) {
    await completeWebhookEvent({
      provider: 'tradein',
      eventId,
      success: false,
      errorMessage: (err as Error).message,
    });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
