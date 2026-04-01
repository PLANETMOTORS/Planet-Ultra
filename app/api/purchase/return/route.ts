import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import {
  getPurchaseSubmissionForUser,
  updatePurchaseSubmissionState,
} from '@/lib/purchase/lifecycleStore';

const PurchaseReturnSchema = z.object({
  submissionId: z.string().uuid(),
  reason: z.string().min(3).max(500).optional(),
});

/**
 * POST /api/purchase/return
 *
 * Initiates a return request inside the 10-day return window.
 * This route does not execute Stripe refunds directly; it creates an auditable
 * return-requested state for ops/workflow handling.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateDecision = await checkRateLimit(
    req,
    { name: 'purchase_return', limit: 3, windowSeconds: 60 },
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

  const parsed = PurchaseReturnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const submission = await getPurchaseSubmissionForUser({
    submissionId: parsed.data.submissionId,
    clerkUserId: userId,
  });
  if (!submission) {
    return NextResponse.json({ error: 'Purchase submission not found' }, { status: 404 });
  }

  if (submission.status === 'return_requested') {
    return NextResponse.json({ status: 'accepted', message: 'Return already requested' }, { status: 200 });
  }
  if (submission.status !== 'paid') {
    return NextResponse.json({ error: 'Return available only for paid purchases' }, { status: 409 });
  }

  const deadline = submission.return_deadline_at ? new Date(submission.return_deadline_at) : null;
  if (!deadline || Number.isNaN(deadline.getTime()) || Date.now() > deadline.getTime()) {
    return NextResponse.json({ error: 'Return window has closed' }, { status: 409 });
  }

  await updatePurchaseSubmissionState({
    submissionId: submission.id,
    toStatus: 'return_requested',
    eventType: 'purchase.return_requested.customer',
    message: parsed.data.reason ?? null,
    payload: { reason: parsed.data.reason ?? null },
  });

  return NextResponse.json({
    status: 'accepted',
    message: 'Return request received. Our team will contact you shortly.',
  }, { status: 200 });
}
