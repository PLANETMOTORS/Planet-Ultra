import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTradeInSubmissionForUser } from '@/lib/tradein/lifecycleStore';

/**
 * GET /api/trade-in/status?submissionId=...
 *
 * Returns current trade-in lifecycle status for the authenticated customer.
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissionId = req.nextUrl.searchParams.get('submissionId');
  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
  }

  const submission = await getTradeInSubmissionForUser({
    submissionId,
    clerkUserId: userId,
  });
  if (!submission) {
    return NextResponse.json({ error: 'Trade-in submission not found' }, { status: 404 });
  }

  return NextResponse.json(
    {
      submissionId: submission.id,
      status: submission.status,
      offerAmountCad: Number(submission.offer_amount_cad),
      offerExpiresAt: submission.offer_expires_at,
      pickupDate: submission.pickup_date,
      pickupWindow: submission.pickup_window,
    },
    { status: 200 },
  );
}
