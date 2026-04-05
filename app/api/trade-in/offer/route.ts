import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { estimateTradeInOffer } from '@/lib/tradein/valuation';
import { createTradeInOffer } from '@/lib/tradein/lifecycleStore';
import { buildSoftLeadEvent, dispatchCrmEventWithReceipt } from '@/lib/crm/autoraptor';

const TradeInOfferSchema = z.object({
  vin: z.string().length(17).optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  make: z.string().min(1).max(64),
  model: z.string().min(1).max(64),
  trim: z.string().max(128).optional(),
  mileageKm: z.number().int().min(0).max(1000000),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  bodyStyle: z.string().max(32).optional(),
  accidentsReported: z.number().int().min(0).max(10).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(7).max(30).optional(),
});

/**
 * POST /api/trade-in/offer
 *
 * Creates an instant trade-in offer and opens trade-in lifecycle status at "offered".
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const rateDecision = await checkRateLimit(
    req,
    { name: 'tradein_offer', limit: 5, windowSeconds: 60 },
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

  const parsed = TradeInOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const offerAmountCad = estimateTradeInOffer({
    year: parsed.data.year,
    mileageKm: parsed.data.mileageKm,
    condition: parsed.data.condition,
    bodyStyle: parsed.data.bodyStyle,
    accidentsReported: parsed.data.accidentsReported,
  });

  const offerExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const submissionId = await createTradeInOffer({
    clerkUserId: userId ?? null,
    vin: parsed.data.vin,
    year: parsed.data.year,
    make: parsed.data.make,
    model: parsed.data.model,
    trim: parsed.data.trim,
    mileageKm: parsed.data.mileageKm,
    conditionGrade: parsed.data.condition,
    offerAmountCad,
    offerExpiresAt,
    payloadRedacted: {
      hasContactInfo:
        Boolean(parsed.data.firstName) ||
        Boolean(parsed.data.lastName) ||
        Boolean(parsed.data.email) ||
        Boolean(parsed.data.phone),
      accidentsReported: parsed.data.accidentsReported ?? 0,
      bodyStyle: parsed.data.bodyStyle ?? null,
    },
  });

  dispatchCrmEventWithReceipt(
    'api.tradein.offer',
    buildSoftLeadEvent({
      vehicleId: parsed.data.vin ?? `tradein-${parsed.data.year}-${parsed.data.make}-${parsed.data.model}`,
      vehicleSlug: `tradein-${parsed.data.year}-${parsed.data.make}-${parsed.data.model}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      vehicleYear: parsed.data.year,
      vehicleMake: parsed.data.make,
      vehicleModel: parsed.data.model,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      clerkUserId: userId ?? undefined,
    }),
  ).catch((err) => {
    console.error('[api/trade-in/offer] CRM dispatch error:', (err as Error).message);
  });

  return NextResponse.json(
    {
      status: 'offered',
      submissionId: submissionId ?? undefined,
      offerAmountCad,
      offerExpiresAt: offerExpiresAt.toISOString(),
      vehicle: {
        year: parsed.data.year,
        make: parsed.data.make,
        model: parsed.data.model,
        trim: parsed.data.trim ?? null,
      },
    },
    { status: 200 },
  );
}
