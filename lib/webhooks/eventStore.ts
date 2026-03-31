import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

type Sql = NeonQueryFunction<false, false>;

function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
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

  return rows.length === 0 ? 'duplicate' : 'recorded';
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
