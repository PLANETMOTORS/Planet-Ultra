import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { DeliveryLifecycleStatus } from '@/types/a5';

type Sql = NeonQueryFunction<false, false>;

type SubmissionRow = {
  id: string;
  status: DeliveryLifecycleStatus;
  tracking_reference: string | null;
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
    fromStatus: DeliveryLifecycleStatus | null;
    toStatus: DeliveryLifecycleStatus;
    trackingReference: string | null;
    message: string | null;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await sql.query(
    `INSERT INTO delivery_submission_events (
      submission_id, event_type, from_status, to_status, tracking_reference, message, payload
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      args.submissionId,
      args.eventType,
      args.fromStatus,
      args.toStatus,
      args.trackingReference,
      args.message,
      JSON.stringify(args.payload),
    ],
  );
}

export async function upsertDeliverySchedule(args: {
  purchaseSubmissionId: string;
  clerkUserId: string;
  vehicleId: string;
  vehicleSlug: string;
  deliveryMethod: 'home' | 'pickup';
  scheduledDate: string;
  scheduledWindow: 'morning' | 'afternoon' | 'evening';
  deliveryAddress?: Record<string, string>;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `INSERT INTO delivery_submissions (
      purchase_submission_id, clerk_user_id, vehicle_id, vehicle_slug, status,
      delivery_method, scheduled_date, scheduled_window, delivery_address, metadata
    ) VALUES (
      $1, $2, $3, $4, 'scheduled', $5, $6::date, $7, $8::jsonb, $9::jsonb
    )
    ON CONFLICT (purchase_submission_id)
    DO UPDATE SET
      clerk_user_id = EXCLUDED.clerk_user_id,
      vehicle_id = EXCLUDED.vehicle_id,
      vehicle_slug = EXCLUDED.vehicle_slug,
      status = 'scheduled',
      delivery_method = EXCLUDED.delivery_method,
      scheduled_date = EXCLUDED.scheduled_date,
      scheduled_window = EXCLUDED.scheduled_window,
      delivery_address = EXCLUDED.delivery_address,
      metadata = EXCLUDED.metadata,
      last_event_type = 'delivery.scheduled.customer',
      last_event_at = NOW(),
      updated_at = NOW()
    RETURNING id`,
    [
      args.purchaseSubmissionId,
      args.clerkUserId,
      args.vehicleId,
      args.vehicleSlug,
      args.deliveryMethod,
      args.scheduledDate,
      args.scheduledWindow,
      JSON.stringify(args.deliveryAddress ?? {}),
      JSON.stringify(args.metadata ?? {}),
    ],
  )) as Array<{ id: string }>;

  const submissionId = rows[0]?.id ?? null;
  if (!submissionId) return null;

  await recordEvent(sql, {
    submissionId,
    eventType: 'delivery.scheduled.customer',
    fromStatus: null,
    toStatus: 'scheduled',
    trackingReference: null,
    message: null,
    payload: {
      purchaseSubmissionId: args.purchaseSubmissionId,
      deliveryMethod: args.deliveryMethod,
      scheduledDate: args.scheduledDate,
      scheduledWindow: args.scheduledWindow,
    },
  });

  return submissionId;
}

export async function updateDeliveryStatusByPurchaseSubmission(args: {
  purchaseSubmissionId: string;
  toStatus: DeliveryLifecycleStatus;
  eventType: string;
  trackingReference?: string | null;
  message?: string | null;
  payload?: Record<string, unknown>;
}): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id, status, tracking_reference
     FROM delivery_submissions
     WHERE purchase_submission_id = $1
     LIMIT 1`,
    [args.purchaseSubmissionId],
  )) as SubmissionRow[];

  if (rows.length === 0) return null;
  const current = rows[0];

  await sql.query(
    `UPDATE delivery_submissions
     SET status = $2,
         tracking_reference = COALESCE($3, tracking_reference),
         last_error = CASE WHEN $4 IS NULL THEN last_error ELSE $4 END,
         last_event_type = $5,
         last_event_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      current.id,
      args.toStatus,
      args.trackingReference ?? null,
      args.message ?? null,
      args.eventType,
    ],
  );

  await recordEvent(sql, {
    submissionId: current.id,
    eventType: args.eventType,
    fromStatus: current.status,
    toStatus: args.toStatus,
    trackingReference: args.trackingReference ?? current.tracking_reference,
    message: args.message ?? null,
    payload: args.payload ?? {},
  });

  return current.id;
}

export async function getDeliveryScheduleForUser(args: {
  purchaseSubmissionId: string;
  clerkUserId: string;
}): Promise<{
  id: string;
  status: DeliveryLifecycleStatus;
  delivery_method: string;
  scheduled_date: string;
  scheduled_window: string;
  tracking_reference: string | null;
} | null> {
  const sql = getSql();
  if (!sql) return null;

  const rows = (await sql.query(
    `SELECT id, status, delivery_method, scheduled_date::text, scheduled_window, tracking_reference
     FROM delivery_submissions
     WHERE purchase_submission_id = $1 AND clerk_user_id = $2
     LIMIT 1`,
    [args.purchaseSubmissionId, args.clerkUserId],
  )) as Array<{
    id: string;
    status: DeliveryLifecycleStatus;
    delivery_method: string;
    scheduled_date: string;
    scheduled_window: string;
    tracking_reference: string | null;
  }>;

  return rows[0] ?? null;
}

