import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import {
  getTradeInSubmissionForUser,
  updateTradeInSubmissionState,
} from '@/lib/tradein/lifecycleStore';

const TradeInAcceptSchema = z.object({
  submissionId: z.string().uuid(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupWindow: z.enum(['morning', 'afternoon', 'evening']),
});

/**
 * POST /api/trade-in/accept
 *
 * Accepts an offered trade-in quote and schedules pickup.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateDecision = await checkRateLimit(
    req,
    { name: 'tradein_accept', limit: 5, windowSeconds: 60 },
    { userId },
  );
  if (!rateDecision.allowed) {
    return buildRateLimitedResponse(rateDecision);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = TradeInAcceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const submission = await getTradeInSubmissionForUser({
    submissionId: parsed.data.submissionId,
    clerkUserId: userId,
  });
  if (!submission) {
    return NextResponse.json({ error: 'Trade-in submission not found' }, { status: 404 });
  }

  if (submission.status === 'accepted' || submission.status === 'scheduled') {
    return NextResponse.json(
      {
        status: submission.status,
        message: 'Trade-in already accepted and scheduled',
        pickupDate: submission.pickup_date,
        pickupWindow: submission.pickup_window,
      },
      { status: 200 },
    );
  }

  if (submission.status !== 'offered') {
    return NextResponse.json(
      { error: 'Only offered trade-ins can be accepted' },
      { status: 409 },
    );
  }

  const expiresAt = new Date(submission.offer_expires_at);
  if (Number.isNaN(expiresAt.getTime()) || Date.now() > expiresAt.getTime()) {
    await updateTradeInSubmissionState({
      submissionId: submission.id,
      toStatus: 'expired',
      eventType: 'tradein.expired.on_accept_attempt',
      message: 'Offer expired before acceptance',
    });
    return NextResponse.json({ error: 'Offer has expired' }, { status: 409 });
  }

  const externalReference = `TRD-${submission.id.slice(0, 8).toUpperCase()}`;

  await updateTradeInSubmissionState({
    submissionId: submission.id,
    toStatus: 'accepted',
    eventType: 'tradein.accepted.customer',
    externalReference,
    pickupDate: parsed.data.pickupDate,
    pickupWindow: parsed.data.pickupWindow,
    payload: {
      pickupDate: parsed.data.pickupDate,
      pickupWindow: parsed.data.pickupWindow,
    },
  });

  await updateTradeInSubmissionState({
    submissionId: submission.id,
    toStatus: 'scheduled',
    eventType: 'tradein.scheduled.pickup',
    externalReference,
    pickupDate: parsed.data.pickupDate,
    pickupWindow: parsed.data.pickupWindow,
    payload: {
      pickupDate: parsed.data.pickupDate,
      pickupWindow: parsed.data.pickupWindow,
    },
  });

  return NextResponse.json(
    {
      status: 'scheduled',
      submissionId: submission.id,
      externalReference,
      pickupDate: parsed.data.pickupDate,
      pickupWindow: parsed.data.pickupWindow,
    },
    { status: 200 },
  );
}
