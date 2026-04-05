import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { FinanceApplicationPayload, FinanceLifecycleStatus } from '@/types/a5';
import { getDatabaseSql } from '@/lib/db/sql';

type Sql = NeonQueryFunction<false, false>;

type SubmissionRow = {
  id: string;
  status: FinanceLifecycleStatus;
  attempt_count: number;
};

function getSql(): Sql | null {
  return getDatabaseSql();
}

function redactedPayload(payload: FinanceApplicationPayload): Record<string, unknown> {
  return {
    vehicleId: payload.vehicleId,
    vehicleSlug: payload.vehicleSlug,
    vehicleYear: payload.vehicleYear,
    vehicleMake: payload.vehicleMake,
    vehicleModel: payload.vehicleModel,
    vehiclePriceCad: payload.vehiclePriceCad,
    downPaymentCad: payload.downPaymentCad,
    termMonths: payload.termMonths,
    clerkUserIdPresent: Boolean(payload.clerkUserId),
  };
}

async function recordEvent(
  sql: Sql,
  args: {
    submissionId: string;
    eventType: string;
    fromStatus: FinanceLifecycleStatus | null;
    toStatus: FinanceLifecycleStatus;
    provider: string | null;
    externalReference: string | null;
    message: string | null;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await sql.query(
    `INSERT INTO finance_submission_events (
      submission_id, event_type, from_status, to_status, provider,
      external_reference, message, payload
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [
      args.submissionId,
      args.eventType,
      args.fromStatus,
      args.toStatus,
      args.provider,
      args.externalReference,
      args.message,
      JSON.stringify(args.payload),
    ],
  );
}

export async function createFinanceSubmission(
  payload: FinanceApplicationPayload,
): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `INSERT INTO finance_submissions (
      clerk_user_id, vehicle_id, vehicle_slug, status, payload_redacted
    ) VALUES ($1, $2, $3, 'submitted', $4::jsonb)
    RETURNING id`,
    [
      payload.clerkUserId,
      payload.vehicleId,
      payload.vehicleSlug,
      JSON.stringify(redactedPayload(payload)),
    ],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id ?? null;
  if (!submissionId) return null;

  await recordEvent(sql, {
    submissionId,
    eventType: 'finance.submitted',
    fromStatus: null,
    toStatus: 'submitted',
    provider: null,
    externalReference: null,
    message: null,
    payload: { vehicleId: payload.vehicleId, vehicleSlug: payload.vehicleSlug },
  });

  return submissionId;
}

export async function updateFinanceSubmissionState(args: {
  submissionId: string;
  toStatus: FinanceLifecycleStatus;
  eventType: string;
  provider?: string | null;
  externalReference?: string | null;
  incrementAttempt?: boolean;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  const currentRows = (await sql.query(
    `SELECT id, status, attempt_count
     FROM finance_submissions
     WHERE id = $1
     LIMIT 1`,
    [args.submissionId],
  )) as SubmissionRow[];

  if (currentRows.length === 0) return;

  const current = currentRows[0];
  const nextAttempts = args.incrementAttempt
    ? current.attempt_count + 1
    : current.attempt_count;

  await sql.query(
    `UPDATE finance_submissions
     SET status = $2,
         provider = COALESCE($3, provider),
         external_reference = COALESCE($4, external_reference),
         attempt_count = $5,
         last_error = CASE WHEN $6 IS NULL THEN last_error ELSE $6 END,
         last_event_type = $7,
         last_event_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      args.submissionId,
      args.toStatus,
      args.provider ?? null,
      args.externalReference ?? null,
      nextAttempts,
      args.message ?? null,
      args.eventType,
    ],
  );

  await recordEvent(sql, {
    submissionId: args.submissionId,
    eventType: args.eventType,
    fromStatus: current.status,
    toStatus: args.toStatus,
    provider: args.provider ?? null,
    externalReference: args.externalReference ?? null,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });
}

export async function updateFinanceSubmissionByReference(args: {
  provider: 'dealertrack' | 'routeone';
  externalReference: string;
  toStatus: FinanceLifecycleStatus;
  eventType: string;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id
     FROM finance_submissions
     WHERE provider = $1 AND external_reference = $2
     ORDER BY updated_at DESC
     LIMIT 1`,
    [args.provider, args.externalReference],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id;
  if (!submissionId) return null;

  await updateFinanceSubmissionState({
    submissionId,
    toStatus: args.toStatus,
    eventType: args.eventType,
    provider: args.provider,
    externalReference: args.externalReference,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });

  return submissionId;
}
