import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getDatabaseSql } from '@/lib/db/sql';

type Sql = NeonQueryFunction<false, false>;

function getSql(): Sql | null {
  return getDatabaseSql();
}

export async function beginWebhookEvent(args: {
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}): Promise<'recorded' | 'duplicate' | 'disabled'> {
  const sql = getSql();
  if (!sql) return 'disabled';

  const rows = (await sql.query(
    `INSERT INTO webhook_events (provider, event_id, event_type, status, payload)
     VALUES ($1, $2, $3, 'received', $4::jsonb)
     ON CONFLICT (provider, event_id) DO NOTHING
     RETURNING id`,
    [args.provider, args.eventId, args.eventType, JSON.stringify(args.payload)],
  )) as Array<{ id: string }>;

  if (rows.length > 0) {
    return 'recorded';
  }

  // Best-effort replay ledger. Never fail the webhook due to analytics logging.
  try {
    await sql.query(
      `INSERT INTO webhook_replay_attempts (provider, event_id, event_type, payload)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [args.provider, args.eventId, args.eventType, JSON.stringify(args.payload)],
    );
  } catch {
    // no-op
  }

  return 'duplicate';
}

export async function completeWebhookEvent(args: {
  provider: string;
  eventId: string;
  success: boolean;
  errorMessage?: string | null;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  await sql.query(
    `UPDATE webhook_events
     SET status = $3,
         processed_at = NOW(),
         error_message = $4,
         updated_at = NOW()
     WHERE provider = $1 AND event_id = $2`,
    [
      args.provider,
      args.eventId,
      args.success ? 'processed' : 'failed',
      args.errorMessage ?? null,
    ],
  );
}
