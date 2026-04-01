import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { PurchaseLifecycleStatus } from '@/types/a5';

type Sql = NeonQueryFunction<false, false>;

type SubmissionRow = {
  id: string;
  status: PurchaseLifecycleStatus;
  stripe_session_id: string | null;
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
    fromStatus: PurchaseLifecycleStatus | null;
    toStatus: PurchaseLifecycleStatus;
    stripeSessionId: string | null;
    message: string | null;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await sql.query(
    `INSERT INTO purchase_submission_events (
      submission_id, event_type, from_status, to_status, stripe_session_id, message, payload
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      args.submissionId,
      args.eventType,
      args.fromStatus,
      args.toStatus,
      args.stripeSessionId,
      args.message,
      JSON.stringify(args.payload),
    ],
  );
}

export async function createPurchaseSubmission(args: {
  clerkUserId: string | null;
  vehicleId: string;
  vehicleSlug: string;
  amountCents: number;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `INSERT INTO purchase_submissions (
      clerk_user_id, vehicle_id, vehicle_slug, status, amount_cents, metadata
    ) VALUES ($1, $2, $3, 'initiated', $4, $5::jsonb)
    RETURNING id`,
    [
      args.clerkUserId,
      args.vehicleId,
      args.vehicleSlug,
      args.amountCents,
      JSON.stringify(args.metadata ?? {}),
    ],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id ?? null;
  if (!submissionId) return null;

  await recordEvent(sql, {
    submissionId,
    eventType: 'purchase.initiated',
    fromStatus: null,
    toStatus: 'initiated',
    stripeSessionId: null,
    message: null,
    payload: { vehicleId: args.vehicleId, vehicleSlug: args.vehicleSlug },
  });

  return submissionId;
}

export async function updatePurchaseSubmissionState(args: {
  submissionId: string;
  toStatus: PurchaseLifecycleStatus;
  eventType: string;
  stripeSessionId?: string | null;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  const rows = (await sql.query(
    `SELECT id, status, stripe_session_id
     FROM purchase_submissions
     WHERE id = $1
     LIMIT 1`,
    [args.submissionId],
  )) as SubmissionRow[];

  if (rows.length === 0) return;

  const current = rows[0];

  await sql.query(
    `UPDATE purchase_submissions
     SET status = $2,
         stripe_session_id = COALESCE($3, stripe_session_id),
         paid_at = CASE WHEN $2 = 'paid' THEN NOW() ELSE paid_at END,
         return_deadline_at = CASE
           WHEN $2 = 'paid' THEN NOW() + INTERVAL '10 days'
           ELSE return_deadline_at
         END,
         return_requested_at = CASE
           WHEN $2 = 'return_requested' THEN NOW()
           ELSE return_requested_at
         END,
         refunded_at = CASE WHEN $2 = 'refunded' THEN NOW() ELSE refunded_at END,
         last_error = CASE WHEN $4 IS NULL THEN last_error ELSE $4 END,
         last_event_type = $5,
         last_event_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      args.submissionId,
      args.toStatus,
      args.stripeSessionId ?? null,
      args.message ?? null,
      args.eventType,
    ],
  );

  await recordEvent(sql, {
    submissionId: args.submissionId,
    eventType: args.eventType,
    fromStatus: current.status,
    toStatus: args.toStatus,
    stripeSessionId: args.stripeSessionId ?? current.stripe_session_id,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });
}

export async function markPurchaseCheckoutCreated(args: {
  submissionId: string;
  stripeSessionId: string;
}): Promise<void> {
  await updatePurchaseSubmissionState({
    submissionId: args.submissionId,
    toStatus: 'checkout_created',
    eventType: 'purchase.checkout_created',
    stripeSessionId: args.stripeSessionId,
    payload: { stripeSessionId: args.stripeSessionId },
  });
}

export async function updatePurchaseByStripeSession(args: {
  stripeSessionId: string;
  toStatus: PurchaseLifecycleStatus;
  eventType: string;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id
     FROM purchase_submissions
     WHERE stripe_session_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [args.stripeSessionId],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id;
  if (!submissionId) return null;

  await updatePurchaseSubmissionState({
    submissionId,
    toStatus: args.toStatus,
    eventType: args.eventType,
    stripeSessionId: args.stripeSessionId,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });

  return submissionId;
}

export async function getPurchaseSubmissionForUser(args: {
  submissionId: string;
  clerkUserId: string;
}): Promise<{ id: string; status: PurchaseLifecycleStatus; return_deadline_at: string | null } | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id, status, return_deadline_at
     FROM purchase_submissions
     WHERE id = $1 AND clerk_user_id = $2
     LIMIT 1`,
    [args.submissionId, args.clerkUserId],
  )) as Array<{ id: string; status: PurchaseLifecycleStatus; return_deadline_at: string | null }>;

  return rows[0] ?? null;
}
