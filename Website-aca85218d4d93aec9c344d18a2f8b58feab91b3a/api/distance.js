/**
 * /api/distance — Vercel serverless function
 * Driving-distance estimate from Richmond Hill, ON to any Canadian postal code.
 *
 * Primary:  Google Maps Distance Matrix API (GOOGLE_MAPS_API_KEY env var)
 * Fallback: Nominatim geocoding + Haversine × 1.30 routing factor (free, no key)
 *
 * GET /api/distance?destination=M1P+3S6
 * Returns: { distanceKm: number, source: string } | { error: string }
 */

const ORIGIN_GOOGLE  = 'L4C 1G7, Richmond Hill, Ontario, Canada';
const ORIGIN_LAT     = 43.8758;
const ORIGIN_LNG     = -79.4378;
const POSTAL_CODE_RE = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

function haversineKm(lat1, lng1, lat2, lng2) {
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

async function geocodePostal(formatted) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q',            `${formatted}, Canada`);
  url.searchParams.set('format',       'json');
  url.searchParams.set('limit',        '1');
  url.searchParams.set('countrycodes', 'ca');
  url.searchParams.set('addressdetails', '0');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'PlanetMotors/1.0 (info@planetmotors.app)' },
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const destination = (req.query.destination || '').trim();

  // Normalise O→0 and I→1 in the digit positions (1, 3, 5 of the cleaned
  // 6-char code) before validation — Canada Post never uses these letters,
  // but users often type them by mistake when entering postal codes.
  function normalisePostal(raw) {
    const chars = raw.toUpperCase().replace(/\s/g, '').split('');
    [1, 3, 5].forEach(i => {
      if (chars[i] === 'O') chars[i] = '0';
      if (chars[i] === 'I') chars[i] = '1';
    });
    return chars.join('');
  }

  const normalised = normalisePostal(destination);

  if (!POSTAL_CODE_RE.test(normalised)) {
    return res.status(400).json({ error: 'Invalid postal code.' });
  }

  const formatted  = `${normalised.slice(0, 3)} ${normalised.slice(3)}`;

  // ── Path A: Google Maps (when API key is present) ─────────────────────────
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const gmUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
      gmUrl.searchParams.set('origins',      ORIGIN_GOOGLE);
      gmUrl.searchParams.set('destinations', `${formatted}, Canada`);
      gmUrl.searchParams.set('mode',         'driving');
      gmUrl.searchParams.set('units',        'metric');
      gmUrl.searchParams.set('region',       'ca');
      gmUrl.searchParams.set('key',          GOOGLE_MAPS_API_KEY);

      const gmRes = await fetch(gmUrl.toString());
      if (gmRes.ok) {
        const data    = await gmRes.json();
        const element = data?.rows?.[0]?.elements?.[0];
        if (data.status === 'OK' && element?.status === 'OK' && element?.distance?.value) {
          const distanceKm = Math.round(element.distance.value / 1000);
          return res.status(200).json({ distanceKm, source: 'google' });
        }
      }
    } catch (_) {
      // fall through to Nominatim
    }
  }

  // ── Path B: Nominatim + Haversine fallback (free, no key required) ────────
  try {
    const coords = await geocodePostal(formatted);

    if (!coords) {
      return res.status(422).json({
        error: 'Postal code could not be located. Please check and try again.',
      });
    }

    const straightLine = haversineKm(ORIGIN_LAT, ORIGIN_LNG, coords.lat, coords.lng);
    // 1.30 routing factor converts straight-line distance to road distance estimate
    const distanceKm = Math.round(straightLine * 1.30);

    return res.status(200).json({ distanceKm, source: 'nominatim' });
  } catch (_) {
    return res.status(502).json({
      error: 'Distance service unavailable. Please contact us for a delivery quote.',
    });
  }
};
