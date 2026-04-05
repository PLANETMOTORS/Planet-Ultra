import { NextRequest, NextResponse } from 'next/server';
import {
  beginWebhookEvent,
  completeWebhookEvent,
} from '@/lib/webhooks/eventStore';
import { updateDeliveryStatusByPurchaseSubmission } from '@/lib/delivery/lifecycleStore';
import type { DeliveryLifecycleStatus } from '@/types/a5';

function resolveDeliveryStatus(eventType: string): DeliveryLifecycleStatus | null {
  switch (eventType) {
    case 'delivery.scheduled':
      return 'scheduled';
    case 'delivery.confirmed':
      return 'confirmed';
    case 'delivery.in_transit':
      return 'in_transit';
    case 'delivery.delivered':
      return 'delivered';
    case 'delivery.failed':
      return 'failed';
    case 'delivery.cancelled':
      return 'cancelled';
    default:
      return null;
  }
}

/**
 * POST /api/webhooks/delivery
 *
 * Status webhook for delivery providers.
 * Expected body:
 * {
 *   "id": "...event id...",
 *   "eventType": "delivery.delivered",
 *   "purchaseSubmissionId": "uuid",
 *   "trackingReference": "optional"
 * }
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.DELIVERY_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get('x-delivery-secret');

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
  const eventType = String(body.eventType ?? body.type ?? 'delivery.unknown');
  const purchaseSubmissionId = String(body.purchaseSubmissionId ?? '');
  const trackingReference = body.trackingReference
    ? String(body.trackingReference)
    : null;

  if (!eventId || !purchaseSubmissionId) {
    return NextResponse.json(
      { error: 'Missing required fields: eventId, purchaseSubmissionId' },
      { status: 400 },
    );
  }

  const eventStoreResult = await beginWebhookEvent({
    provider: 'delivery',
    eventId,
    eventType,
    payload: body,
  });
  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    const status = resolveDeliveryStatus(eventType);
    if (!status) {
      await completeWebhookEvent({
        provider: 'delivery',
        eventId,
        success: true,
      });
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const submissionId = await updateDeliveryStatusByPurchaseSubmission({
      purchaseSubmissionId,
      toStatus: status,
      eventType: `delivery.webhook.${eventType}`,
      trackingReference,
      payload: { eventType, trackingReference },
    });
    if (!submissionId) {
      await completeWebhookEvent({
        provider: 'delivery',
        eventId,
        success: false,
        errorMessage: 'delivery_submission_not_found',
      });
      return NextResponse.json(
        { error: 'Delivery submission not found' },
        { status: 404 },
      );
    }

    await completeWebhookEvent({
      provider: 'delivery',
      eventId,
      success: true,
    });

    return NextResponse.json({ received: true, status }, { status: 200 });
  } catch (err) {
    await completeWebhookEvent({
      provider: 'delivery',
      eventId,
      success: false,
      errorMessage: (err as Error).message,
    });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
