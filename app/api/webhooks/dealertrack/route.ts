import { NextRequest, NextResponse } from 'next/server';
import { updateFinanceSubmissionByReference } from '@/lib/finance/lifecycleStore';

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

  const body = (await req.json()) as DealertrackWebhookBody;
  const eventType = body.eventType ?? body.type ?? 'dealertrack.unknown';
  const externalReference = body.applicationId ?? body.application_id ?? null;
  const status = body.status ?? body.decision ?? null;

  if (!externalReference) {
    console.warn('[webhook/dealertrack] Missing application reference', {
      eventType,
    });
    return NextResponse.json(
      { received: true, status: 'ignored_missing_reference' },
      { status: 200 },
    );
  }

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

  return NextResponse.json(
    {
      received: true,
      status: 'processed',
      matchedSubmission: Boolean(submissionId),
    },
    { status: 200 },
  );
}
