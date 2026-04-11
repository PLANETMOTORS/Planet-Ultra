/**
 * PCI / PIPEDA audit logging.
 *
 * Logs security-relevant events (deposit initiation, payment state changes,
 * admin access) to the webhook_events table for immutable record-keeping.
 *
 * Rules:
 * - Never log raw PII (card numbers, full names). Use opaque identifiers only.
 * - Never log Stripe secret keys or webhook secrets.
 * - All entries include actor, action, resource, and timestamp.
 * - Logs are append-only — the webhook_events table uses ON CONFLICT DO NOTHING
 *   semantics, and rows are never updated after initial insert.
 */

import { getDatabaseSql } from '@/lib/db/sql';

export interface AuditEntry {
  /** Actor identifier (e.g. clerkUserId, 'system', 'stripe_webhook') */
  actor: string;
  /** Action performed (e.g. 'deposit.initiated', 'deposit.paid') */
  action: string;
  /** Resource affected (e.g. vehicleId, submissionId) */
  resource: string;
  /** Non-sensitive metadata for context */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Writes an immutable audit log entry to the database.
 * Fails silently if the database is not configured — audit logging
 * must never block the primary transaction.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const sql = getDatabaseSql();
  if (!sql) return;

  try {
    await sql.query(
      `INSERT INTO webhook_events (provider, event_id, event_type, status, payload)
       VALUES ('audit', $1, $2, 'processed', $3::jsonb)
       ON CONFLICT (provider, event_id) DO NOTHING`,
      [
        `audit:${entry.action}:${entry.resource}:${Date.now()}`,
        entry.action,
        JSON.stringify({
          actor: entry.actor,
          resource: entry.resource,
          ...entry.metadata,
          timestamp: new Date().toISOString(),
        }),
      ],
    );
  } catch (err) {
    // Audit logging must never break the primary flow
    console.error('[audit] Failed to write audit log:', (err as Error).message);
  }
}
