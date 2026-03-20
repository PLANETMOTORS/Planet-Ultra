// ============================================================
// HomeNet IOL — Inventory Feed Integration
// ============================================================
// HomeNet IOL (Cox Automotive) provides dealer inventory data
// including vehicle specs, pricing, and hosted images.
//
// ENV VARIABLES REQUIRED:
//   HOMENET_DEALER_ID    — Your HomeNet dealer ID
//   HOMENET_API_KEY      — Your HomeNet API key
//   HOMENET_FEED_URL     — Override feed URL (optional)
//
// HomeNet feed docs: https://developer.homenetiol.com
// ============================================================

import axios from 'axios';
import type { Vehicle, VehicleImage } from './types';
import { slugify, buildVdpPath, estimateBiweekly } from './utils';

const HOMENET_BASE_URL = process.env.HOMENET_FEED_URL || 'https://api.homenetiol.com/feeds';
const DEALER_ID        = process.env.HOMENET_DEALER_ID || '';
const API_KEY          = process.env.HOMENET_API_KEY   || '';

// ── HomeNet raw vehicle shape ────────────────────────────────
interface HomeNetVehicle {
  vin:              string;
  stocknumber:      string;
  year:             string | number;
  make:             string;
  model:            string;
  trim:             string;
  body:             string;
  extcolor:         string;
  intcolor?:        string;
  transmission?:    string;
  drivetrain?:      string;
  engine?:          string;
  doors?:           number;
  seats?:           number;
  mileage:          number;
  price:            number;
  saleprice?:       number;
  internetprice?:   number;
  status:           string;  // 'A' = available, 'S' = sold
  fuel?:            string;
  evrange?:         number;
  description?:     string;
  features?:        string[];
  photos?:          { url: string; seq: number }[];
  lastupdated?:     string;
  solddate?:        string;
}

// ── Fetch inventory from HomeNet IOL ────────────────────────
export async function fetchHomeNetInventory(): Promise<Vehicle[]> {
  if (!DEALER_ID || !API_KEY) {
    console.warn('[HomeNet] Missing HOMENET_DEALER_ID or HOMENET_API_KEY — skipping HomeNet feed');
    return [];
  }

  try {
    const response = await axios.get<HomeNetVehicle[]>(
      `${HOMENET_BASE_URL}/inventory`,
      {
        params: {
          dealer_id: DEALER_ID,
          format:    'json',
          status:    'all',  // fetch active + recently sold
        },
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept':        'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.map(normalizeHomeNetVehicle);
  } catch (error) {
    console.error('[HomeNet] Failed to fetch inventory:', error);
    return [];
  }
}

// ── Fetch single VDP by stock number ────────────────────────
export async function fetchHomeNetVehicle(stock: string): Promise<Vehicle | null> {
  if (!DEALER_ID || !API_KEY) return null;

  try {
    const response = await axios.get<HomeNetVehicle>(
      `${HOMENET_BASE_URL}/inventory/${stock}`,
      {
        params: { dealer_id: DEALER_ID },
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept':        'application/json',
        },
        timeout: 8000,
      }
    );

    return normalizeHomeNetVehicle(response.data);
  } catch (error) {
    console.error(`[HomeNet] Failed to fetch vehicle ${stock}:`, error);
    return null;
  }
}

// ── Normalizer: HomeNet → Planet Motors Vehicle ──────────────
function normalizeHomeNetVehicle(raw: HomeNetVehicle): Vehicle {
  const year  = Number(raw.year);
  const make  = raw.make  || '';
  const model = raw.model || '';
  const trim  = raw.trim  || '';
  const stock = raw.stocknumber || '';
  const price = raw.internetprice || raw.saleprice || raw.price || 0;
  const km    = raw.mileage || 0;

  const fuelRaw  = (raw.fuel || '').toLowerCase();
  const fuel     = mapFuelType(fuelRaw);
  const status   = raw.status === 'S' ? 'sold' : 'available';

  // Build images array from HomeNet photo URLs
  // HomeNet image naming pattern: {vin}-{seq}-{view}.jpg
  const images: VehicleImage[] = (raw.photos || [])
    .sort((a, b) => a.seq - b.seq)
    .map((p, i) => ({
      url:      p.url,
      alt:      buildImageAlt(raw.extcolor, year, make, model, trim, i),
      sequence: p.seq,
      view:     i === 0 ? 'exterior' : i <= 3 ? 'exterior' : 'interior',
      width:    800,
      height:   533,
    }));

  const canonicalPath = buildVdpPath(year, make, model, trim, stock);

  return {
    id:           stock,
    stock,
    vin:          raw.vin || '',
    year,
    make,
    model,
    trim,
    body:         raw.body || '',
    color:        raw.extcolor || '',
    colorInt:     raw.intcolor,
    fuel,
    transmission: raw.transmission,
    drivetrain:   raw.drivetrain,
    engine:       raw.engine,
    doors:        raw.doors,
    seats:        raw.seats,
    km,
    evRange:      raw.evrange,
    price,
    biweekly:     estimateBiweekly(price),
    status,
    soldAt:       raw.solddate,
    images,
    description:  raw.description || buildDescription(year, make, model, trim, km),
    features:     raw.features || [],
    badges:       buildBadges(fuel, km, raw.extcolor),
    canonicalPath,
    source:       'homenet',
    updatedAt:    raw.lastupdated || new Date().toISOString(),
  };
}

// ── Helpers ──────────────────────────────────────────────────
function mapFuelType(raw: string): Vehicle['fuel'] {
  if (raw.includes('electric') || raw.includes('ev') || raw.includes('bev')) return 'electric';
  if (raw.includes('plug') || raw.includes('phev'))                          return 'plug-in hybrid';
  if (raw.includes('hybrid') || raw.includes('hev'))                         return 'hybrid';
  if (raw.includes('diesel'))                                                 return 'diesel';
  return 'gasoline';
}

function buildImageAlt(
  color: string, year: number, make: string, model: string, trim: string, index: number
): string {
  const views = ['Front exterior', 'Side exterior', 'Rear exterior', 'Interior cabin', 'Detail'];
  const view  = views[index] || 'View';
  const name  = `${year} ${make} ${model}${trim ? ' ' + trim : ''}`;
  return `${view} view of ${color} ${name} for sale in Richmond Hill, ON`;
}

function buildDescription(
  year: number, make: string, model: string, trim: string, km: number
): string {
  return `${year} ${make} ${model}${trim ? ' ' + trim : ''}, ${km.toLocaleString('en-CA')} km. Available at Planet Motors in Richmond Hill, ON. 10-day money-back guarantee, $250 refundable deposit, and nationwide delivery.`;
}

function buildBadges(fuel: Vehicle['fuel'], km: number, color: string): string[] {
  const badges: string[] = [];
  if (fuel === 'electric')       badges.push('EV');
  if (fuel === 'plug-in hybrid') badges.push('PHEV');
  if (fuel === 'hybrid')         badges.push('HYBRID');
  if (km < 30000)                badges.push('LOW KM');
  return badges;
}

