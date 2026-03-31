import { NextRequest, NextResponse } from 'next/server';
import { updateFinanceSubmissionByReference } from '@/lib/finance/lifecycleStore';
import { beginWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/eventStore';

/**
 * POST /api/webhooks/dealertrack
 * Status: STUB / RESERVED
 *
 * Dealertrack may send credit application status callbacks.
 * Validates shared secret, acknowledges receipt. Full handling is future work.
 */

type DealertrackWebhookBody = {
  type?: string;
  eventType?: string;
  applicationId?: string;
  application_id?: string;
  status?: string;
  decision?: string;
  message?: string;
  [k: string]: unknown;
};

function mapDealertrackStatusToLifecycle(
  statusRaw: string | null,
): 'acknowledged' | 'failed' | 'dead_letter' {
  const status = (statusRaw ?? '').toLowerCase();
  if (['approved', 'accepted', 'acknowledged', 'funded'].includes(status)) {
    return 'acknowledged';
  }
  if (['dead_letter', 'dead-letter', 'terminal_failure'].includes(status)) {
    return 'dead_letter';
  }
  return 'failed';
}

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.DEALERTRACK_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get('x-dealertrack-secret');

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody = await req.text();
  let body: DealertrackWebhookBody;
  try {
    body = JSON.parse(rawBody) as DealertrackWebhookBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const eventType = body.eventType ?? body.type ?? 'dealertrack.unknown';
  const externalReference = body.applicationId ?? body.application_id ?? null;
  const status = body.status ?? body.decision ?? null;
  const eventId =
    req.headers.get('x-event-id') ??
    [eventType, externalReference ?? 'no-ref', status ?? 'unknown'].join(':');

  const eventStoreResult = await beginWebhookEvent({
    provider: 'dealertrack',
    eventId,
    eventType,
    payload: body,
  });

  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  if (!externalReference) {
    console.warn('[webhook/dealertrack] Missing application reference', {
      eventType,
    });
    await completeWebhookEvent({
      provider: 'dealertrack',
      eventId,
      success: false,
      errorMessage: 'missing application reference',
    });
    return NextResponse.json(
      { received: true, status: 'ignored_missing_reference' },
      { status: 200 },
    );
  }

  try {
    const lifecycleStatus = mapDealertrackStatusToLifecycle(status);
    const submissionId = await updateFinanceSubmissionByReference({
      provider: 'dealertrack',
      externalReference,
      toStatus: lifecycleStatus,
      eventType: `dealertrack.webhook.${eventType}`,
      message: body.message ?? null,
      payload: {
        status: status ?? null,
        decision: body.decision ?? null,
      },
    });

    console.info('[webhook/dealertrack] Event processed', {
      eventType,
      externalReference,
      lifecycleStatus,
      matchedSubmission: Boolean(submissionId),
    });

    await completeWebhookEvent({
      provider: 'dealertrack',
      eventId,
      success: true,
    });

    return NextResponse.json(
      {
        received: true,
        status: 'processed',
        matchedSubmission: Boolean(submissionId),
      },
      { status: 200 },
    );
  } catch (err) {
    await completeWebhookEvent({
      provider: 'dealertrack',
      eventId,
      success: false,
      errorMessage: (err as Error).message,
    });
    throw err;
  }
}
