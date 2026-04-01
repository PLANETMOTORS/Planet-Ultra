import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { getPurchaseSubmissionForUser } from '@/lib/purchase/lifecycleStore';
import {
  getDeliveryScheduleForUser,
  upsertDeliverySchedule,
} from '@/lib/delivery/lifecycleStore';

const DeliveryScheduleSchema = z.object({
  submissionId: z.string().uuid(),
  deliveryMethod: z.enum(['home', 'pickup']),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledWindow: z.enum(['morning', 'afternoon', 'evening']),
  deliveryAddress: z
    .object({
      line1: z.string().min(2).max(200).optional(),
      line2: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      province: z.string().max(50).optional(),
      postalCode: z.string().max(20).optional(),
    })
    .optional(),
});

/**
 * POST /api/purchase/delivery
 *
 * Customer delivery scheduling boundary.
 * Allowed when purchase is in paid state to keep checkout/payment sequencing sane.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateDecision = await checkRateLimit(
    req,
    { name: 'purchase_delivery', limit: 5, windowSeconds: 60 },
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

  const parsed = DeliveryScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const purchase = await getPurchaseSubmissionForUser({
    submissionId: parsed.data.submissionId,
    clerkUserId: userId,
  });
  if (!purchase) {
    return NextResponse.json({ error: 'Purchase submission not found' }, { status: 404 });
  }
  if (purchase.status !== 'paid') {
    return NextResponse.json(
      { error: 'Delivery can be scheduled after payment confirmation' },
      { status: 409 },
    );
  }

  const deliverySubmissionId = await upsertDeliverySchedule({
    purchaseSubmissionId: purchase.id,
    clerkUserId: userId,
    vehicleId: purchase.vehicle_id,
    vehicleSlug: purchase.vehicle_slug,
    deliveryMethod: parsed.data.deliveryMethod,
    scheduledDate: parsed.data.scheduledDate,
    scheduledWindow: parsed.data.scheduledWindow,
    deliveryAddress: parsed.data.deliveryAddress,
    metadata: { source: 'api.purchase.delivery' },
  });

  return NextResponse.json(
    {
      status: 'scheduled',
      deliverySubmissionId: deliverySubmissionId ?? undefined,
      submissionId: purchase.id,
      scheduledDate: parsed.data.scheduledDate,
      scheduledWindow: parsed.data.scheduledWindow,
      deliveryMethod: parsed.data.deliveryMethod,
    },
    { status: 200 },
  );
}

/**
 * GET /api/purchase/delivery?submissionId=...
 *
 * Returns customer-visible delivery status and tracking reference.
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

  const delivery = await getDeliveryScheduleForUser({
    purchaseSubmissionId: submissionId,
    clerkUserId: userId,
  });
  if (!delivery) {
    return NextResponse.json({ error: 'Delivery schedule not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: delivery.status,
    deliveryMethod: delivery.delivery_method,
    scheduledDate: delivery.scheduled_date,
    scheduledWindow: delivery.scheduled_window,
    trackingReference: delivery.tracking_reference,
  });
}
