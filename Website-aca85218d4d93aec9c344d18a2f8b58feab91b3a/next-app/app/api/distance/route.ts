/**
 * /api/distance — Driving distance from Richmond Hill, ON to any Canadian postal code.
 *
 * Primary:  Google Maps Distance Matrix API (requires GOOGLE_MAPS_API_KEY env var)
 *           Returns real driving distance in km.
 *
 * Fallback: geocoder.ca postal-code geocoding + Haversine straight-line × 1.30 routing factor
 *           — free, no API key required, activates automatically when Google fails or key absent.
 *           geocoder.ca reliably resolves Canadian postal codes to accurate centroid coordinates,
 *           unlike Nominatim which misidentifies many Canadian postal codes entirely.
 *
 * GET /api/distance?destination=M1P+3S6
 * Returns: { distanceKm: number, source: 'google' | 'geocoder' } | { error: string }
 */

import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';

// Planet Motors origin — Richmond Hill, ON L4C 1G7
const ORIGIN_GOOGLE = 'L4C 1G7, Richmond Hill, Ontario, Canada';
const ORIGIN_LAT    = 43.8758;
const ORIGIN_LNG    = -79.4378;

// Canadian postal code: A1A 1A1 or A1A1A1
const POSTAL_CODE_RE = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

// Haversine formula — straight-line distance in km between two lat/lng points
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dO = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dO / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Geocode a Canadian postal code via geocoder.ca (free, no key needed).
 *
 * geocoder.ca is purpose-built for Canadian postal codes and returns accurate
 * centroid coordinates. Nominatim was previously used here but consistently
 * misidentified Canadian postal codes (e.g. mapped Thornhill L3T 1B1 to an
 * unrelated location in Alberta, producing a wildly wrong ~3,375 km distance).
 *
 * API: https://geocoder.ca/?postal=L3T1B1&json=1
 * Returns: { latt: "43.799672", longt: "-79.418571", standard: { city: "Thornhill" } }
 * On error: { success: false, error: { code: "...", message: "..." } }
 */
async function geocodePostal(formatted: string): Promise<{ lat: number; lng: number } | null> {
  const clean = formatted.replace(/\s/g, '');
  const url   = `https://geocoder.ca/?postal=${encodeURIComponent(clean)}&json=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'PlanetMotors/1.0 (info@planetmotors.app)' },
    next: { revalidate: 86400 }, // cache 24 hrs per postal code — avoids rate-limit (2 req/s)
  });

  if (!res.ok) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  // geocoder.ca returns success:false + error object for bad/unknown codes
  if (data.error || data.success === false) return null;

  const lat = parseFloat(data.latt);
  const lng = parseFloat(data.longt);
  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get('destination')?.trim() ?? '';

  // 1. Validate
  if (!POSTAL_CODE_RE.test(destination)) {
    return NextResponse.json({ error: 'Invalid postal code.' }, { status: 400 });
  }

  // 2. Normalise
  const normalised = destination.toUpperCase().replace(/\s/g, '');
  const formatted  = `${normalised.slice(0, 3)} ${normalised.slice(3)}`;

  // ── Path A: Google Maps (when API key is present) ─────────────────────────
  if (GOOGLE_MAPS_API_KEY) {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins',      ORIGIN_GOOGLE);
    url.searchParams.set('destinations', `${formatted}, Canada`);
    url.searchParams.set('mode',         'driving');
    url.searchParams.set('units',        'metric');
    url.searchParams.set('region',       'ca');
    url.searchParams.set('key',          GOOGLE_MAPS_API_KEY);

    try {
      const googleRes = await fetch(url.toString(), { next: { revalidate: 3600 } });

      if (googleRes.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await googleRes.json();
        const element   = data?.rows?.[0]?.elements?.[0];

        if (data.status === 'OK' && element?.status === 'OK' && element?.distance?.value) {
          const distanceKm = Math.round(element.distance.value / 1000);
          return NextResponse.json({ distanceKm, source: 'google' });
        }
      }
    } catch (err) {
      console.error('[distance] Google Maps error, falling back to geocoder.ca:', err);
    }

    // If Google failed despite having a key, fall through to geocoder.ca fallback
    console.warn('[distance] Google Maps call failed — using geocoder.ca fallback');
  } else {
    console.info('[distance] GOOGLE_MAPS_API_KEY not set — using geocoder.ca fallback');
  }

  // ── Path B: geocoder.ca + Haversine fallback (free, no key required) ──────
  //
  // geocoder.ca resolves Canadian postal codes to accurate centroid coordinates.
  // Haversine gives straight-line distance; multiplying by 1.30 converts to a
  // conservative driving-distance estimate (industry-standard factor for Canada).
  // Note: for short distances (< 300 km) all results show "Free Delivery" so
  //       minor inaccuracy in the fallback path has zero pricing impact.
  try {
    const coords = await geocodePostal(formatted);

    if (!coords) {
      return NextResponse.json(
        { error: 'Postal code could not be located. Please check and try again.' },
        { status: 422 }
      );
    }

    const straightLine = haversineKm(ORIGIN_LAT, ORIGIN_LNG, coords.lat, coords.lng);

    // 1.30 routing factor converts straight-line distance to a road distance estimate.
    const distanceKm = Math.round(straightLine * 1.30);

    return NextResponse.json({ distanceKm, source: 'geocoder' });
  } catch (err) {
    console.error('[distance] geocoder.ca fallback failed:', err);
    return NextResponse.json(
      { error: 'Distance service unavailable. Please contact us for a delivery quote.' },
      { status: 502 }
    );
  }
}
