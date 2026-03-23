import { neon } from '@neondatabase/serverless';
import type { Vehicle, VehicleImage, Vehicle360Asset } from '@/types/vehicle';

export interface VehicleVdp {
  vehicle: Vehicle;
  heroImage: VehicleImage;
  galleryImages: VehicleImage[];
  spinSets: Vehicle360Asset[];
}

/**
 * Load a full VDP record by slug from Neon.
 * Returns null when the slug does not match any vehicle.
 */
export async function getVehicleVdp(slug: string): Promise<VehicleVdp | null> {
  const sql = neon(process.env.DATABASE_URL!);

  // ── vehicle row ──────────────────────────────────────────────
  const vehicleRows = await sql`
    SELECT
      v.id,
      v.slug,
      v.vin,
      v.stock_number,
      v.year,
      v.make,
      v.model,
      v.trim,
      v.body_style,
      v.drivetrain,
      v.fuel_type,
      v.transmission,
      v.mileage_km,
      v.exterior_color,
      v.interior_color,
      v.price_cad,
      v.sale_price_cad,
      v.status,
      v.is_featured,
      v.is_certified,
      v.seo_title,
      v.seo_description,
      v.description,
      v.feature_bullets,
      v.packages,
      v.options,
      v.created_at,
      v.updated_at
    FROM vehicles v
    WHERE v.slug = ${slug}
    LIMIT 1
  `;

  if (vehicleRows.length === 0) return null;

  const row = vehicleRows[0];

  // ── media assets ─────────────────────────────────────────────
  const mediaRows = await sql`
    SELECT
      ma.secure_url,
      ma.alt_text,
      ma.width,
      ma.height,
      ma.usage,
      ma.position
    FROM media_assets ma
    WHERE ma.vehicle_id = ${row.id}
    ORDER BY ma.position ASC
  `;

  let heroImage: VehicleImage = { url: '', alt: '' };
  const galleryImages: VehicleImage[] = [];

  for (const m of mediaRows) {
    const img: VehicleImage = {
      url: m.secure_url,
      alt: m.alt_text ?? undefined,
      width: m.width ?? undefined,
      height: m.height ?? undefined,
    };

    if (m.usage === 'hero') {
      heroImage = img;
    } else {
      galleryImages.push(img);
    }
  }

  // ── spin sets ────────────────────────────────────────────────
  const spinRows = await sql`
    SELECT
      ss.spin_type,
      ss.viewer_url,
      ss.poster_image_url
    FROM spin_sets ss
    WHERE ss.vehicle_id = ${row.id}
  `;

  const spinSets: Vehicle360Asset[] = spinRows.map((s) => ({
    type: (s.spin_type ?? 'spin') as Vehicle360Asset['type'],
    url: s.viewer_url,
    posterImageUrl: s.poster_image_url ?? undefined,
  }));

  // ── assemble vehicle ────────────────────────────────────────
  const vehicle: Vehicle = {
    id: row.id,
    slug: row.slug,
    vin: row.vin,
    stockNumber: row.stock_number,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim ?? undefined,
    bodyStyle: row.body_style ?? undefined,
    drivetrain: row.drivetrain ?? undefined,
    fuelType: row.fuel_type ?? undefined,
    transmission: row.transmission ?? undefined,
    mileageKm: row.mileage_km,
    exteriorColor: row.exterior_color ?? undefined,
    interiorColor: row.interior_color ?? undefined,
    priceCad: row.price_cad,
    salePriceCad: row.sale_price_cad ?? undefined,
    status: row.status,
    isFeatured: row.is_featured ?? undefined,
    isCertified: row.is_certified ?? undefined,
    description: row.description ?? undefined,
    featureBullets: row.feature_bullets ?? undefined,
    packages: row.packages ?? undefined,
    options: row.options ?? undefined,
    heroImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
    hero360Asset: spinSets[0] ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at ?? undefined,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at ?? undefined,
  };

  return { vehicle, heroImage, galleryImages, spinSets };
}
