/**
 * Finance application submission boundary.
 *
 * Security rules enforced here:
 * - Sensitive PII (name, email, phone) is never stored in plain text in Postgres.
 * - PII is relayed directly to RouteOne or Dealertrack via HTTPS and then
 *   discarded from server memory.
 * - When the integration is not live (feature flag off), the submission is
 *   logged at INFO level (no PII in logs) and returns status 'queued'.
 * - No finance logic runs in the browser. This module is server-only.
 */

import type {
  FinanceApplicationPayload,
  FinanceSubmissionResult,
} from '@/types/a5';
import {
  createFinanceSubmission,
  updateFinanceSubmissionState,
} from '@/lib/finance/lifecycleStore';

const ROUTEONE_ENABLED = process.env.ENABLE_ROUTEONE === '1';
const DEALERTRACK_ENABLED = process.env.ENABLE_DEALERTRACK === '1';

/**
 * Submits a finance application to RouteOne.
 * Fails fast — throws on network error so the caller can decide to fall
 * through to Dealertrack or return 'queued'.
 */
async function submitToRouteOne(
  payload: FinanceApplicationPayload,
): Promise<string> {
  const apiUrl = process.env.ROUTEONE_API_URL;
  const dealerId = process.env.ROUTEONE_DEALER_ID;
  const apiKey = process.env.ROUTEONE_API_KEY;

  if (!apiUrl || !dealerId || !apiKey) {
    throw new Error('[finance/routeone] Missing RouteOne env configuration');
  }

  const res = await fetch(`${apiUrl}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Dealer-Id': dealerId,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      dealer_id: dealerId,
      vehicle: {
        year: payload.vehicleYear,
        make: payload.vehicleMake,
        model: payload.vehicleModel,
        price_cad: payload.vehiclePriceCad,
        stock_id: payload.vehicleId,
      },
      applicant: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      },
      terms: {
        down_payment_cad: payload.downPaymentCad,
        term_months: payload.termMonths,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`[finance/routeone] HTTP ${res.status}`);
  }

  const data = (await res.json()) as { application_id?: string };
  return data.application_id ?? 'unknown';
}

/**
 * Submits a finance application to Dealertrack.
 * Same structure as RouteOne — isolated so they can evolve independently.
 */
async function submitToDealertrack(
  payload: FinanceApplicationPayload,
): Promise<string> {
  const apiUrl = process.env.DEALERTRACK_API_URL;
  const dealerId = process.env.DEALERTRACK_DEALER_ID;
  const apiKey = process.env.DEALERTRACK_API_KEY;

  if (!apiUrl || !dealerId || !apiKey) {
    throw new Error(
      '[finance/dealertrack] Missing Dealertrack env configuration',
    );
  }

  const res = await fetch(`${apiUrl}/credit-applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Dealer-Id': dealerId,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      dealerId,
      vehicleYear: payload.vehicleYear,
      vehicleMake: payload.vehicleMake,
      vehicleModel: payload.vehicleModel,
      vehiclePrice: payload.vehiclePriceCad,
      stockNumber: payload.vehicleId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      downPayment: payload.downPaymentCad,
      termMonths: payload.termMonths,
    }),
  });

  if (!res.ok) {
    throw new Error(`[finance/dealertrack] HTTP ${res.status}`);
  }

  const data = (await res.json()) as { applicationId?: string };
  return data.applicationId ?? 'unknown';
}

/**
 * Primary submission entry point.
 *
 * Tries RouteOne first, then Dealertrack if RouteOne is not enabled.
 * If neither integration is live, returns status 'queued' so the shell
 * can acknowledge receipt without a live lender call.
 *
 * PII note: firstName, lastName, email, phone are used only for the outbound
 * lender API call. They are never written to Postgres in this function.
 */
export async function submitFinanceApplication(
  payload: FinanceApplicationPayload,
): Promise<FinanceSubmissionResult> {
  const submissionId = await createFinanceSubmission(payload);

  // Log submission attempt without PII
  console.info('[finance/submit] Application received', {
    submissionId,
    vehicleId: payload.vehicleId,
    vehicleSlug: payload.vehicleSlug,
    clerkUserId: payload.clerkUserId,
    downPaymentCad: payload.downPaymentCad,
    termMonths: payload.termMonths,
  });

  if (ROUTEONE_ENABLED) {
    try {
      const referenceId = await submitToRouteOne(payload);
      if (submissionId) {
        await updateFinanceSubmissionState({
          submissionId,
          toStatus: 'forwarded',
          eventType: 'finance.forwarded.routeone',
          provider: 'routeone',
          externalReference: referenceId,
          incrementAttempt: true,
          payload: { provider: 'routeone' },
        });
      }
      return { status: 'accepted', submissionId: submissionId ?? undefined, referenceId };
    } catch (err) {
      console.error('[finance/submit] RouteOne failed:', (err as Error).message);
      if (submissionId) {
        await updateFinanceSubmissionState({
          submissionId,
          toStatus: 'retried',
          eventType: 'finance.retry.after_routeone_failure',
          incrementAttempt: true,
          message: (err as Error).message,
          payload: { provider: 'routeone' },
        });
      }
      // Fall through to Dealertrack.
    }
  }

  if (DEALERTRACK_ENABLED) {
    try {
      const referenceId = await submitToDealertrack(payload);
      if (submissionId) {
        await updateFinanceSubmissionState({
          submissionId,
          toStatus: 'forwarded',
          eventType: 'finance.forwarded.dealertrack',
          provider: 'dealertrack',
          externalReference: referenceId,
          incrementAttempt: true,
          payload: { provider: 'dealertrack' },
        });
      }
      return { status: 'accepted', submissionId: submissionId ?? undefined, referenceId };
    } catch (err) {
      const message = (err as Error).message;
      const maxAttempts = Number(process.env.FINANCE_MAX_ATTEMPTS ?? '3');
      const deadLetter = maxAttempts <= 1;

      if (submissionId) {
        await updateFinanceSubmissionState({
          submissionId,
          toStatus: deadLetter ? 'dead_letter' : 'failed',
          eventType: deadLetter
            ? 'finance.dead_letter.dealertrack'
            : 'finance.failed.dealertrack',
          provider: 'dealertrack',
          incrementAttempt: true,
          message,
          payload: { provider: 'dealertrack' },
        });
      }

      console.error(
        '[finance/submit] Dealertrack failed:',
        message,
      );
      return {
        status: 'failed',
        submissionId: submissionId ?? undefined,
        message: 'Lender submission failed. Our team will follow up.',
      };
    }
  }

  // Both integrations off — return 'queued' for clean feature-flag behavior
  if (submissionId) {
    await updateFinanceSubmissionState({
      submissionId,
      toStatus: 'queued',
      eventType: 'finance.queued.manual_review',
      payload: { reason: 'no_provider_enabled' },
    });
  }

  return {
    status: 'queued',
    submissionId: submissionId ?? undefined,
    message: 'Your application has been received. Our finance team will contact you shortly.',
  };
}
