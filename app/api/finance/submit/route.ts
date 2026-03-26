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

const FinanceSubmitFormSchema = z.object({
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),
  vehicleYear: z.coerce.number().int().min(1900).max(2100),
  vehicleMake: z.string().min(1).max(100),
  vehicleModel: z.string().min(1).max(100),
  vehiclePriceCad: z.coerce.number().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(7).max(30),
  downPaymentCad: z.coerce.number().min(0),
  termMonths: z.coerce.number().int().min(12).max(96),
});

async function parseFinanceSubmitBody(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return req.json();
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await req.formData();
    return Object.fromEntries(formData.entries());
  }

  return req.json();
}

export async function POST(req: NextRequest) {
  // Resolve session — optional for finance applications
  const { userId } = await auth();

  let body: unknown;
  try {
    body = await parseFinanceSubmitBody(req);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed =
    body instanceof FormData
      ? FinanceSubmitFormSchema.safeParse(Object.fromEntries(body.entries()))
      : FinanceSubmitSchema.safeParse(body);

  const normalized =
    parsed.success || typeof body !== 'object' || body === null
      ? parsed
      : FinanceSubmitFormSchema.safeParse(body);

  if (!normalized.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: normalized.error.issues },
      { status: 400 },
    );
  }

  const payload: FinanceApplicationPayload = {
    ...normalized.data,
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
