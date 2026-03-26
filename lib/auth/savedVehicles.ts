/**
 * Saved vehicles persistence layer.
 *
 * Storage: Postgres (Neon). Table: saved_vehicles
 * Schema (to be applied via migration):
 *
 *   CREATE TABLE IF NOT EXISTS saved_vehicles (
 *     id           SERIAL PRIMARY KEY,
 *     clerk_user_id VARCHAR(255) NOT NULL,
 *     vehicle_id   VARCHAR(255) NOT NULL,
 *     vehicle_slug VARCHAR(500) NOT NULL,
 *     saved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     UNIQUE (clerk_user_id, vehicle_id)
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_saved_vehicles_user
 *     ON saved_vehicles (clerk_user_id);
 *
 * All functions in this file run server-side only.
 * No saved-vehicle logic ever executes in the browser.
 *
 * Neon client note: @neondatabase/serverless is intentionally not listed as
 * a direct dependency until DATABASE_URL is provisioned. The module is
 * resolved at runtime only when DB_AVAILABLE is true. The build-time warning
 * is suppressed by the runtime guard below.
 */

import type { SavedVehicleRecord } from '@/types/a5';

type SqlFn = (query: string, params?: unknown[]) => Promise<unknown[]>;

/**
 * Returns true when the DATABASE_URL environment variable is present,
 * indicating the Postgres connection is configured.
 */
function dbAvailable(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Lazy Postgres SQL executor.
 * Returns null when DATABASE_URL is not configured.
 * Install @neondatabase/serverless and set DATABASE_URL to activate.
 */
async function getSql(): Promise<SqlFn | null> {
  if (!dbAvailable()) return null;
  try {
    const mod = require('@neondatabase/serverless') as { neon: (url: string) => SqlFn };
    return mod.neon(process.env.DATABASE_URL!);
  } catch {
    return null;
  }
}

/**
 * Fetches all saved vehicles for a Clerk user, ordered newest-first.
 */
export async function getSavedVehicles(
  clerkUserId: string,
): Promise<SavedVehicleRecord[]> {
  const sql = await getSql();
  if (!sql) return [];

  try {
    const rows = await sql(
      `SELECT clerk_user_id, vehicle_id, vehicle_slug, saved_at
       FROM saved_vehicles
       WHERE clerk_user_id = $1
       ORDER BY saved_at DESC`,
      [clerkUserId],
    ) as Array<{ clerk_user_id: string; vehicle_id: string; vehicle_slug: string; saved_at: string }>;

    return rows.map((r) => ({
      clerkUserId: r.clerk_user_id,
      vehicleId: r.vehicle_id,
      vehicleSlug: r.vehicle_slug,
      savedAt: r.saved_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Returns true if the vehicle is currently saved by the user.
 */
export async function isVehicleSaved(
  clerkUserId: string,
  vehicleId: string,
): Promise<boolean> {
  const sql = await getSql();
  if (!sql) return false;

  try {
    const rows = await sql(
      `SELECT 1 FROM saved_vehicles
       WHERE clerk_user_id = $1 AND vehicle_id = $2
       LIMIT 1`,
      [clerkUserId, vehicleId],
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Saves a vehicle for a user. Idempotent — safe to call if already saved.
 */
export async function saveVehicle(
  clerkUserId: string,
  vehicleId: string,
  vehicleSlug: string,
): Promise<{ ok: boolean }> {
  const sql = await getSql();
  if (!sql) return { ok: false };

  try {
    await sql(
      `INSERT INTO saved_vehicles (clerk_user_id, vehicle_id, vehicle_slug)
       VALUES ($1, $2, $3)
       ON CONFLICT (clerk_user_id, vehicle_id) DO NOTHING`,
      [clerkUserId, vehicleId, vehicleSlug],
    );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Removes a saved vehicle for a user.
 */
export async function unsaveVehicle(
  clerkUserId: string,
  vehicleId: string,
): Promise<{ ok: boolean }> {
  const sql = await getSql();
  if (!sql) return { ok: false };

  try {
    await sql(
      `DELETE FROM saved_vehicles
       WHERE clerk_user_id = $1 AND vehicle_id = $2`,
      [clerkUserId, vehicleId],
    );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
