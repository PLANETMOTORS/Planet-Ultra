import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { Vehicle, VehicleStatus } from '@/types/vehicle';
import { buildCanonicalVdpPath } from '@/lib/seo/urlUtils';

type Sql = NeonQueryFunction<false, false>;

type InventoryVehicleRow = {
  slug: string;
  vin: string;
  stock: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  vehicle_type: string | null;
  drivetrain: string | null;
  fuel_type: string | null;
  transmission: string | null;
  mileage_km: number | null;
  exterior_color: string | null;
  interior_color: string | null;
  selling_price_cad: number | null;
  status: string | null;
  imported_at: string;
};

const FALLBACK_HERO_IMAGE_URL =
  'https://res.cloudinary.com/planet-motors/image/upload/v1700000000/vehicles/bmw-x3-fixture-hero.jpg';

function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

function toVehicleStatus(value: string | null): VehicleStatus {
  if (value === 'sold') return 'sold';
  if (value === 'pending') return 'pending';
  if (value === 'reserved') return 'reserved';
  return 'available';
}

function rowToVehicle(row: InventoryVehicleRow): Vehicle {
  return {
    id: row.vin,
    slug: row.slug,
    vin: row.vin,
    stockNumber: row.stock,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim ?? undefined,
    bodyStyle: row.vehicle_type ?? undefined,
    drivetrain: row.drivetrain ?? undefined,
    fuelType: row.fuel_type ?? undefined,
    transmission: row.transmission ?? undefined,
    mileageKm: row.mileage_km ?? 0,
    exteriorColor: row.exterior_color ?? undefined,
    interiorColor: row.interior_color ?? undefined,
    priceCad: row.selling_price_cad ?? 0,
    status: toVehicleStatus(row.status),
    heroImage: {
      url: FALLBACK_HERO_IMAGE_URL,
      alt: `${row.year} ${row.make} ${row.model}`,
      width: 1920,
      height: 1280,
    },
    updatedAt: row.imported_at,
  };
}

export interface InventoryCardRecord {
  vehicle: Vehicle;
  canonicalPath: string;
}

export async function getInventoryCards(limit = 60): Promise<InventoryCardRecord[]> {
  const sql = getSql();
  if (!sql) return [];

  try {
    const rows = (await sql.query(
      `SELECT
        slug, vin, stock, year, make, model, trim, vehicle_type, drivetrain, fuel_type,
        transmission, mileage_km, exterior_color, interior_color, selling_price_cad,
        status, imported_at
       FROM inventory_vehicles
       WHERE status IS NULL OR status != 'sold'
       ORDER BY year DESC, imported_at DESC
       LIMIT $1`,
      [limit],
    )) as InventoryVehicleRow[];

    return rows.map((row) => {
      const vehicle = rowToVehicle(row);
      return {
        vehicle,
        canonicalPath: buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug),
      };
    });
  } catch (error) {
    // Handle case where table doesn't exist yet (e.g., during initial build)
    // PostgreSQL error code 42P01 = undefined_table
    if (error instanceof Error && 'code' in error && error.code === '42P01') {
      return [];
    }
    throw error;
  }
}

export async function getInventoryVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    const rows = (await sql.query(
      `SELECT
        slug, vin, stock, year, make, model, trim, vehicle_type, drivetrain, fuel_type,
        transmission, mileage_km, exterior_color, interior_color, selling_price_cad,
        status, imported_at
       FROM inventory_vehicles
       WHERE slug = $1
       LIMIT 1`,
      [slug],
    )) as InventoryVehicleRow[];

    if (rows.length === 0) return null;
    return rowToVehicle(rows[0]);
  } catch (error) {
    // Handle case where table doesn't exist yet (e.g., during initial build)
    // PostgreSQL error code 42P01 = undefined_table
    if (error instanceof Error && 'code' in error && error.code === '42P01') {
      return null;
    }
    throw error;
  }
}

/**
 * Resolves a vehicle by both ID (VIN) and slug.
 * Both references must point to the same record.
 */
export async function getInventoryVehicleByReference(
  vehicleId: string,
  vehicleSlug: string,
): Promise<Vehicle | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    const rows = (await sql.query(
      `SELECT
        slug, vin, stock, year, make, model, trim, vehicle_type, drivetrain, fuel_type,
        transmission, mileage_km, exterior_color, interior_color, selling_price_cad,
        status, imported_at
       FROM inventory_vehicles
       WHERE vin = $1 AND slug = $2
       LIMIT 1`,
      [vehicleId, vehicleSlug],
    )) as InventoryVehicleRow[];

    if (rows.length === 0) return null;
    return rowToVehicle(rows[0]);
  } catch (error) {
    // Handle case where table doesn't exist yet (e.g., during initial build)
    // PostgreSQL error code 42P01 = undefined_table
    if (error instanceof Error && 'code' in error && error.code === '42P01') {
      return null;
    }
    throw error;
  }
}

export async function resolveInventoryCanonicalPathBySlug(slug: string): Promise<string | null> {
  const vehicle = await getInventoryVehicleBySlug(slug);
  if (!vehicle) return null;
  return buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug);
}
