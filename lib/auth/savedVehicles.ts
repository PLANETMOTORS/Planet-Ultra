/**
 * Saved vehicles persistence layer.
 *
 * Storage: Postgres (Neon serverless). Table: saved_vehicles
 * Migration: db/migrations/001_saved_vehicles.sql
 *
 * All functions run server-side only.
 * Returns safe empty/false responses when DATABASE_URL is not set.
 */

import { neon } from '@neondatabase/serverless';
import type { SavedVehicleRecord } from '@/types/a5';

type SqlFn = (query: string, params?: unknown[]) => Promise<unknown[]>;

/**
 * Returns a Neon SQL executor when DATABASE_URL is configured, null otherwise.
 * All callers must handle the null case gracefully.
 */
function getSql(): SqlFn | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url) as unknown as SqlFn;
}

/**
 * Fetches all saved vehicles for a Clerk user, ordered newest-first.
 */
export async function getSavedVehicles(
  clerkUserId: string,
): Promise<SavedVehicleRecord[]> {
  const sql = getSql();
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
  const sql = getSql();
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
  const sql = getSql();
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
  const sql = getSql();
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
