/**
 * AutoRaptor CRM adapter.
 *
 * Responsibilities:
 * - Normalize Planet-Ultra CRM events to AutoRaptor's API format.
 * - Send events over HTTPS server-to-server.
 * - Log dispatch outcomes without logging PII.
 * - Implement simple retry (1 retry on 5xx) with exponential backoff.
 * - Return a typed CrmDispatchResult so callers can decide on failure behavior.
 *
 * When ENABLE_AUTORAPTOR is not '1', all events are logged and returned
 * with status 'disabled' — no outbound call is made.
 */

import type { CrmEventPayload, CrmDispatchResult } from '@/types/a5';
import { createCrmDispatchLog, finalizeCrmDispatchLog } from '@/lib/crm/dispatchStore';

const AUTORAPTOR_ENABLED = process.env.ENABLE_AUTORAPTOR === '1';

/**
 * Maps a Planet-Ultra CRM event type to the AutoRaptor lead_type value.
 */
function mapEventType(eventType: CrmEventPayload['eventType']): string {
  const mapping: Record<CrmEventPayload['eventType'], string> = {
    soft_lead: 'Internet',
    finance_lead: 'Finance',
    purchase_deposit: 'Deposit',
    vehicle_view: 'VehicleView',
  };
  return mapping[eventType] ?? 'Internet';
}

/**
 * Builds the AutoRaptor-formatted payload from a CrmEventPayload.
 * Only fields that are present in the event are included.
 */
function buildAutoraptorPayload(event: CrmEventPayload): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    lead_type: mapEventType(event.eventType),
    vehicle: {
      year: event.vehicleYear,
      make: event.vehicleMake,
      model: event.vehicleModel,
      stock_number: event.vehicleId,
    },
    occurred_at: event.occurredAt,
    source: 'planet-ultra',
  };

  if (event.firstName) payload['first_name'] = event.firstName;
  if (event.lastName) payload['last_name'] = event.lastName;
  if (event.email) payload['email'] = event.email;
  if (event.phone) payload['phone'] = event.phone;
  if (event.meta) payload['meta'] = event.meta;

  return payload;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Dispatches a single CRM event to AutoRaptor.
 * Retries once on 5xx with a 500ms delay.
 */
export async function dispatchCrmEvent(
  event: CrmEventPayload,
): Promise<CrmDispatchResult> {
  if (!AUTORAPTOR_ENABLED) {
    console.info('[crm/autoraptor] Integration disabled — event logged only', {
      eventType: event.eventType,
      vehicleId: event.vehicleId,
      occurredAt: event.occurredAt,
    });
    return { status: 'disabled', eventType: event.eventType, attempts: 0, provider: 'autoraptor' };
  }

  const apiUrl = process.env.AUTORAPTOR_API_URL;
  const apiKey = process.env.AUTORAPTOR_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('[crm/autoraptor] Missing env configuration');
    return {
      status: 'error',
      eventType: event.eventType,
      error: 'Missing configuration',
      attempts: 0,
      provider: 'autoraptor',
    };
  }

  const body = buildAutoraptorPayload(event);
  let lastError = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(500);

    try {
      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        console.info('[crm/autoraptor] Event dispatched', {
          eventType: event.eventType,
          vehicleId: event.vehicleId,
          referenceId: data.id,
        });
        return {
          status: 'sent',
          eventType: event.eventType,
          referenceId: data.id,
          attempts: attempt + 1,
          provider: 'autoraptor',
        };
      }

      // 4xx — don't retry
      if (res.status < 500) {
        lastError = `HTTP ${res.status}`;
        break;
      }

      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = (err as Error).message;
    }
  }

  console.error('[crm/autoraptor] Dispatch failed', {
    eventType: event.eventType,
    vehicleId: event.vehicleId,
    error: lastError,
  });

  return {
    status: 'error',
    eventType: event.eventType,
    error: lastError,
    attempts: 2,
    provider: 'autoraptor',
  };
}

/**
 * Dispatch wrapper with persistent delivery receipt logging.
 * Source should identify caller path, e.g. "api.finance.submit".
 */
export async function dispatchCrmEventWithReceipt(
  source: string,
  event: CrmEventPayload,
): Promise<CrmDispatchResult> {
  const dispatchLogId = await createCrmDispatchLog({ source, event });
  const result = await dispatchCrmEvent(event);
  if (dispatchLogId) {
    await finalizeCrmDispatchLog({ id: dispatchLogId, result });
  }
  return result;
}

/**
 * Convenience builder for a soft lead event (e.g. contact form, trade-in inquiry).
 */
export function buildSoftLeadEvent(params: {
  vehicleId: string;
  vehicleSlug: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  clerkUserId?: string;
}): CrmEventPayload {
  return {
    eventType: 'soft_lead',
    occurredAt: new Date().toISOString(),
    ...params,
  };
}

/**
 * Convenience builder for a finance lead event.
 */
export function buildFinanceLeadEvent(params: {
  vehicleId: string;
  vehicleSlug: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clerkUserId?: string;
}): CrmEventPayload {
  return {
    eventType: 'finance_lead',
    occurredAt: new Date().toISOString(),
    ...params,
  };
}

/**
 * Convenience builder for a purchase/deposit event.
 */
export function buildDepositEvent(params: {
  vehicleId: string;
  vehicleSlug: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  clerkUserId: string;
  meta?: Record<string, string | number | boolean>;
}): CrmEventPayload {
  return {
    eventType: 'purchase_deposit',
    occurredAt: new Date().toISOString(),
    ...params,
  };
}
