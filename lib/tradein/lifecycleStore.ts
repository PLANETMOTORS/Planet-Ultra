import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { TradeInLifecycleStatus } from '@/types/a5';

type Sql = NeonQueryFunction<false, false>;

type SubmissionRow = {
  id: string;
  status: TradeInLifecycleStatus;
  external_reference: string | null;
};

function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function recordEvent(
  sql: Sql,
  args: {
    submissionId: string;
    eventType: string;
    fromStatus: TradeInLifecycleStatus | null;
    toStatus: TradeInLifecycleStatus;
    externalReference: string | null;
    message: string | null;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await sql.query(
    `INSERT INTO tradein_submission_events (
      submission_id, event_type, from_status, to_status, external_reference, message, payload
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      args.submissionId,
      args.eventType,
      args.fromStatus,
      args.toStatus,
      args.externalReference,
      args.message,
      JSON.stringify(args.payload),
    ],
  );
}

export async function createTradeInOffer(args: {
  clerkUserId: string | null;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileageKm: number;
  conditionGrade: 'excellent' | 'good' | 'fair' | 'poor';
  offerAmountCad: number;
  offerExpiresAt: Date;
  payloadRedacted?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `INSERT INTO tradein_submissions (
      clerk_user_id, status, vin, year, make, model, trim, mileage_km,
      condition_grade, offer_amount_cad, offer_expires_at, payload_redacted
    ) VALUES (
      $1, 'offered', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb
    )
    RETURNING id`,
    [
      args.clerkUserId,
      args.vin ?? null,
      args.year,
      args.make,
      args.model,
      args.trim ?? null,
      args.mileageKm,
      args.conditionGrade,
      args.offerAmountCad,
      args.offerExpiresAt.toISOString(),
      JSON.stringify(args.payloadRedacted ?? {}),
    ],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id ?? null;
  if (!submissionId) return null;

  await recordEvent(sql, {
    submissionId,
    eventType: 'tradein.offered',
    fromStatus: null,
    toStatus: 'offered',
    externalReference: null,
    message: null,
    payload: { offerAmountCad: args.offerAmountCad },
  });

  return submissionId;
}

export async function getTradeInSubmissionForUser(args: {
  submissionId: string;
  clerkUserId: string;
}): Promise<{
  id: string;
  status: TradeInLifecycleStatus;
  offer_amount_cad: string;
  offer_expires_at: string;
  pickup_date: string | null;
  pickup_window: string | null;
} | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id, status, offer_amount_cad::text, offer_expires_at::text, pickup_date::text, pickup_window
     FROM tradein_submissions
     WHERE id = $1 AND clerk_user_id = $2
     LIMIT 1`,
    [args.submissionId, args.clerkUserId],
  )) as Array<{
    id: string;
    status: TradeInLifecycleStatus;
    offer_amount_cad: string;
    offer_expires_at: string;
    pickup_date: string | null;
    pickup_window: string | null;
  }>;

  return rows[0] ?? null;
}

export async function updateTradeInSubmissionState(args: {
  submissionId: string;
  toStatus: TradeInLifecycleStatus;
  eventType: string;
  externalReference?: string | null;
  pickupDate?: string | null;
  pickupWindow?: string | null;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  const rows = (await sql.query(
    `SELECT id, status, external_reference
     FROM tradein_submissions
     WHERE id = $1
     LIMIT 1`,
    [args.submissionId],
  )) as SubmissionRow[];

  if (rows.length === 0) return;
  const current = rows[0];

  await sql.query(
    `UPDATE tradein_submissions
     SET status = $2,
         external_reference = COALESCE($3, external_reference),
         accepted_at = CASE WHEN $2 = 'accepted' THEN NOW() ELSE accepted_at END,
         pickup_date = COALESCE($4::date, pickup_date),
         pickup_window = COALESCE($5, pickup_window),
         inspected_at = CASE WHEN $2 = 'inspected' THEN NOW() ELSE inspected_at END,
         completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
         last_error = CASE WHEN $6 IS NULL THEN last_error ELSE $6 END,
         last_event_type = $7,
         last_event_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      args.submissionId,
      args.toStatus,
      args.externalReference ?? null,
      args.pickupDate ?? null,
      args.pickupWindow ?? null,
      args.message ?? null,
      args.eventType,
    ],
  );

  await recordEvent(sql, {
    submissionId: args.submissionId,
    eventType: args.eventType,
    fromStatus: current.status,
    toStatus: args.toStatus,
    externalReference: args.externalReference ?? current.external_reference,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });
}

export async function updateTradeInByExternalReference(args: {
  externalReference: string;
  toStatus: TradeInLifecycleStatus;
  eventType: string;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id
     FROM tradein_submissions
     WHERE external_reference = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [args.externalReference],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id;
  if (!submissionId) return null;

  await updateTradeInSubmissionState({
    submissionId,
    toStatus: args.toStatus,
    eventType: args.eventType,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });

  return submissionId;
}
