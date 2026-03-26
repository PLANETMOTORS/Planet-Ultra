import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { submitFinanceApplication } from '@/lib/finance/submissionBoundary';
import type { FinanceApplicationPayload } from '@/types/a5';

/**
 * POST /api/finance/submit
 *
 * Finance application server boundary.
 *
 * Security contract:
 * - Auth is optional (shoppers may apply without a Clerk account).
 *   If a session exists, clerkUserId is resolved server-side and attached.
 * - PII fields (firstName, lastName, email, phone) are accepted from the
 *   client, validated with Zod, and then passed directly to the lender
 *   adapter. They are never written to Postgres.
 * - Vehicle facts (year, make, model, price) come from the client but are
 *   validated; production callers should pass values fetched from Postgres.
 * - No finance calculation logic runs here — calculations stay in FinanceEngine.
 */

const FinanceSubmitSchema = z.object({
  // Vehicle context
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),
  vehicleYear: z.number().int().min(1900).max(2100),
  vehicleMake: z.string().min(1).max(100),
  vehicleModel: z.string().min(1).max(100),
  vehiclePriceCad: z.number().positive(),

  // Applicant — PII, validated but never stored in Postgres
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(7).max(30),

  // Finance parameters
  downPaymentCad: z.number().min(0),
  termMonths: z.number().int().min(12).max(96),
});

export async function POST(req: NextRequest) {
  // Resolve session — optional for finance applications
  const { userId } = await auth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = FinanceSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const payload: FinanceApplicationPayload = {
    ...parsed.data,
    clerkUserId: userId ?? null,
  };

  try {
    const result = await submitFinanceApplication(payload);

    const statusCode =
      result.status === 'accepted' || result.status === 'queued' ? 200 : 502;

    return NextResponse.json(result, { status: statusCode });
  } catch (err) {
    console.error('[api/finance/submit] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
