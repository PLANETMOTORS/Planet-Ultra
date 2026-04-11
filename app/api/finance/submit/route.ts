import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { submitFinanceApplication } from '@/lib/finance/submissionBoundary';
import { dispatchCrmEventWithReceipt, buildFinanceLeadEvent } from '@/lib/crm/autoraptor';
import { checkRateLimit, buildRateLimitedResponse } from '@/lib/security/rateLimit';
import { apiError, apiInternalError } from '@/lib/security/apiError';
import { getInventoryVehicleByReference } from '@/lib/inventory/repository';
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
 * - Vehicle facts (year, make, model, price) are resolved from inventory DB.
 *   Client-supplied values are not used as source-of-truth.
 * - No finance calculation logic runs here — calculations stay in FinanceEngine.
 */

const FinanceSubmitSchema = z.object({
  // Vehicle reference (truth resolved from inventory DB)
  vehicleId: z.string().min(1).max(255),
  vehicleSlug: z.string().min(1).max(500),

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
  const rateDecision = await checkRateLimit(
    req,
    { name: 'finance_submit', limit: 5, windowSeconds: 60 },
    { userId },
  );
  if (!rateDecision.allowed) {
    return buildRateLimitedResponse(rateDecision);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const parsed = FinanceSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_FAILED', 'Invalid request payload');
  }

  const verifiedVehicle = await getInventoryVehicleByReference(
    parsed.data.vehicleId,
    parsed.data.vehicleSlug,
  );
  if (!verifiedVehicle || verifiedVehicle.status === 'sold') {
    return apiError(409, 'VEHICLE_UNAVAILABLE', 'Vehicle is unavailable or reference mismatch');
  }

  const payload: FinanceApplicationPayload = {
    vehicleId: verifiedVehicle.id,
    vehicleSlug: verifiedVehicle.slug,
    vehicleYear: verifiedVehicle.year,
    vehicleMake: verifiedVehicle.make,
    vehicleModel: verifiedVehicle.model,
    vehiclePriceCad: verifiedVehicle.priceCad,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    downPaymentCad: parsed.data.downPaymentCad,
    termMonths: parsed.data.termMonths,
    clerkUserId: userId ?? null,
  };

  try {
    const result = await submitFinanceApplication(payload);

    // Dispatch CRM finance lead event — fire-and-forget, non-blocking
    dispatchCrmEventWithReceipt('api.finance.submit', buildFinanceLeadEvent({
      vehicleId: verifiedVehicle.id,
      vehicleSlug: verifiedVehicle.slug,
      vehicleYear: verifiedVehicle.year,
      vehicleMake: verifiedVehicle.make,
      vehicleModel: verifiedVehicle.model,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      clerkUserId: userId ?? undefined,
    })).catch((err) => {
      console.error('[api/finance/submit] CRM dispatch error:', (err as Error).message);
    });

    const statusCode =
      result.status === 'accepted' || result.status === 'queued' ? 200 : 502;

    return NextResponse.json(result, { status: statusCode });
  } catch (err) {
    return apiInternalError('api/finance/submit', err);
  }
}
