import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { CrmDispatchResult, CrmEventPayload } from '@/types/a5';
import { getDatabaseSql } from '@/lib/db/sql';

type Sql = NeonQueryFunction<false, false>;

function getSql(): Sql | null {
  return getDatabaseSql();
}

function redactEventPayload(event: CrmEventPayload): Record<string, unknown> {
  return {
    eventType: event.eventType,
    vehicleId: event.vehicleId,
    vehicleSlug: event.vehicleSlug,
    vehicleYear: event.vehicleYear,
    vehicleMake: event.vehicleMake,
    vehicleModel: event.vehicleModel,
    occurredAt: event.occurredAt,
    hasFirstName: Boolean(event.firstName),
    hasLastName: Boolean(event.lastName),
    hasEmail: Boolean(event.email),
    hasPhone: Boolean(event.phone),
    hasMeta: Boolean(event.meta),
    clerkUserIdPresent: Boolean(event.clerkUserId),
  };
}

export async function createCrmDispatchLog(args: {
  source: string;
  event: CrmEventPayload;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `INSERT INTO crm_dispatch_log (
      source, event_type, status, vehicle_id, vehicle_slug, payload_redacted
    ) VALUES ($1, $2, 'queued', $3, $4, $5::jsonb)
    RETURNING id`,
    [
      args.source,
      args.event.eventType,
      args.event.vehicleId,
      args.event.vehicleSlug,
      JSON.stringify(redactEventPayload(args.event)),
    ],
  )) as Array<{ id: string }>;

  return rows[0]?.id ?? null;
}

export async function finalizeCrmDispatchLog(args: {
  id: string;
  result: CrmDispatchResult;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  const deadLetter = args.result.status === 'error';
  const status =
    args.result.status === 'sent'
      ? 'sent'
      : args.result.status === 'disabled'
        ? 'disabled'
        : args.result.status === 'queued'
          ? 'queued'
          : 'failed';

  await sql.query(
    `UPDATE crm_dispatch_log
     SET status = $2,
         provider = COALESCE($3, provider),
         provider_reference = $4,
         attempt_count = $5,
         dead_letter = $6,
         error_message = $7,
         delivered_at = CASE WHEN $2 = 'sent' THEN NOW() ELSE delivered_at END,
         updated_at = NOW()
     WHERE id = $1`,
    [
      args.id,
      status,
      args.result.provider ?? 'autoraptor',
      args.result.referenceId ?? null,
      args.result.attempts ?? 0,
      deadLetter,
      args.result.error ?? null,
    ],
  );
}
