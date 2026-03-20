// ============================================================
// DriveEai — AI-Powered Inventory & Pricing Integration
// ============================================================
// DriveEai provides AI-enhanced vehicle listings, market pricing,
// lead intelligence, and inventory syndication for Canadian dealers.
//
// ENV VARIABLES REQUIRED:
//   DRIVEAI_DEALER_ID   — Your DriveEai dealer/account ID
//   DRIVEAI_API_KEY     — Your DriveEai API key
//   DRIVEAI_API_URL     — DriveEai base API URL
//
// Contact DriveEai for API credentials and documentation.
// ============================================================

import axios from 'axios';
import type { Vehicle, VehicleImage } from './types';
import { slugify, buildVdpPath, estimateBiweekly } from './utils';

const DRIVEAI_BASE_URL = process.env.DRIVEAI_API_URL   || 'https://api.driveai.com/v1';
const DEALER_ID        = process.env.DRIVEAI_DEALER_ID || '';
const API_KEY          = process.env.DRIVEAI_API_KEY   || '';

// ── DriveEai raw vehicle shape ───────────────────────────────
interface DriveAiVehicle {
  id:             string;
  stock_number:   string;
  vin:            string;
  year:           number;
  make:           string;
  model:          string;
  trim:           string;
  body_style:     string;
  exterior_color: string;
  interior_color?: string;
  fuel_type:      string;
  transmission?:  string;
  drivetrain?:    string;
  odometer_km:    number;
  asking_price:   number;
  market_price?:  number;   // AI-estimated market value
  status:         'active' | 'sold' | 'pending';
  sold_date?:     string;
  ev_range_km?:   number;
  battery_kwh?:   number;
  description?:   string;
  features?:      string[];
  media?: {
    photos: { url: string; order: number; type: 'exterior' | 'interior' | 'detail' }[];
  };
  updated_at?:    string;
  ai_insights?: {
    days_on_market_avg?: number;
    demand_score?:       number;   // 0–100
    price_position?:     'below_market' | 'at_market' | 'above_market';
  };
}

// ── Fetch all inventory from DriveEai ────────────────────────
export async function fetchDriveAiInventory(): Promise<Vehicle[]> {
  if (!DEALER_ID || !API_KEY) {
    console.warn('[DriveEai] Missing DRIVEAI_DEALER_ID or DRIVEAI_API_KEY — skipping DriveEai feed');
    return [];
  }

  try {
    const response = await axios.get<{ data: DriveAiVehicle[]; total: number }>(
      `${DRIVEAI_BASE_URL}/dealers/${DEALER_ID}/inventory`,
      {
        params: {
          status:   'all',
          per_page: 500,
        },
        headers: {
          'X-API-Key': API_KEY,
          'Accept':    'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.data.map(normalizeDriveAiVehicle);
  } catch (error) {
    console.error('[DriveEai] Failed to fetch inventory:', error);
    return [];
  }
}

// ── Fetch single vehicle by stock number ─────────────────────
export async function fetchDriveAiVehicle(stock: string): Promise<Vehicle | null> {
  if (!DEALER_ID || !API_KEY) return null;

  try {
    const response = await axios.get<DriveAiVehicle>(
      `${DRIVEAI_BASE_URL}/dealers/${DEALER_ID}/inventory/${stock}`,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Accept':    'application/json',
        },
        timeout: 8000,
      }
    );

    return normalizeDriveAiVehicle(response.data);
  } catch (error) {
    console.error(`[DriveEai] Failed to fetch vehicle ${stock}:`, error);
    return null;
  }
}

// ── Get AI-enhanced market pricing for a vehicle ─────────────
export async function getDriveAiMarketPrice(vin: string): Promise<{
  market_price: number;
  price_position: string;
  demand_score: number;
} | null> {
  if (!DEALER_ID || !API_KEY) return null;

  try {
    const response = await axios.get(
      `${DRIVEAI_BASE_URL}/market-data/price`,
      {
        params: { vin, dealer_id: DEALER_ID },
        headers: { 'X-API-Key': API_KEY },
        timeout: 5000,
      }
    );
    return response.data;
  } catch {
    return null;
  }
}

// ── Normalizer: DriveEai → Planet Motors Vehicle ─────────────
function normalizeDriveAiVehicle(raw: DriveAiVehicle): Vehicle {
  const year  = raw.year;
  const make  = raw.make  || '';
  const model = raw.model || '';
  const trim  = raw.trim  || '';
  const stock = raw.stock_number || '';
  const km    = raw.odometer_km || 0;
  const price = raw.asking_price || 0;

  const fuel   = mapFuelType(raw.fuel_type || '');
  const status = raw.status === 'sold' ? 'sold' : raw.status === 'pending' ? 'pending' : 'available';

  // Build optimized images array
  const photos = raw.media?.photos || [];
  const images: VehicleImage[] = photos
    .sort((a, b) => a.order - b.order)
    .map((p, i) => ({
      url:    p.url,
      alt:    buildImageAlt(raw.exterior_color, year, make, model, trim, i),
      view:   p.type,
      width:  800,
      height: 533,
    }));

  // Build AI-powered badges
  const badges = buildBadges(fuel, km, raw.ai_insights);
  const was    = raw.market_price && raw.market_price > price ? raw.market_price : undefined;

  return {
    id:           stock,
    stock,
    vin:          raw.vin || '',
    year,
    make,
    model,
    trim,
    body:         raw.body_style || '',
    color:        raw.exterior_color || '',
    colorInt:     raw.interior_color,
    fuel,
    transmission: raw.transmission,
    drivetrain:   raw.drivetrain,
    km,
    evRange:      raw.ev_range_km,
    batteryCapacity: raw.battery_kwh,
    price,
    biweekly:     estimateBiweekly(price),
    was,
    status,
    soldAt:       raw.sold_date,
    images,
    description:  raw.description || buildDescription(year, make, model, trim, km),
    features:     raw.features || [],
    badges,
    canonicalPath: buildVdpPath(year, make, model, trim, stock),
    source:       'driveai',
    updatedAt:    raw.updated_at || new Date().toISOString(),
  };
}

// ── Helpers ──────────────────────────────────────────────────
function mapFuelType(raw: string): Vehicle['fuel'] {
  const r = raw.toLowerCase();
  if (r.includes('electric') || r === 'ev' || r === 'bev')  return 'electric';
  if (r.includes('plug') || r === 'phev')                    return 'plug-in hybrid';
  if (r.includes('hybrid') || r === 'hev')                   return 'hybrid';
  if (r.includes('diesel'))                                   return 'diesel';
  return 'gasoline';
}

function buildImageAlt(
  color: string, year: number, make: string, model: string, trim: string, index: number
): string {
  const views = ['Front exterior', 'Side exterior', 'Rear exterior', 'Interior cabin', 'Detail'];
  const view  = views[index] ?? 'View';
  const name  = `${year} ${make} ${model}${trim ? ' ' + trim : ''}`;
  return `${view} view of ${color} ${name} for sale in Richmond Hill, ON`;
}

function buildDescription(
  year: number, make: string, model: string, trim: string, km: number
): string {
  return `${year} ${make} ${model}${trim ? ' ' + trim : ''}, ${km.toLocaleString('en-CA')} km. Available at Planet Motors in Richmond Hill, ON. 10-day money-back guarantee, $250 refundable deposit, and nationwide delivery.`;
}

function buildBadges(
  fuel: Vehicle['fuel'],
  km: number,
  aiInsights?: DriveAiVehicle['ai_insights']
): string[] {
  const badges: string[] = [];
  if (fuel === 'electric')       badges.push('EV');
  if (fuel === 'plug-in hybrid') badges.push('PHEV');
  if (fuel === 'hybrid')         badges.push('HYBRID');
  if (km < 30000)                badges.push('LOW KM');
  if (aiInsights?.price_position === 'below_market') badges.push('GREAT PRICE');
  if (aiInsights?.demand_score && aiInsights.demand_score >= 80) badges.push('HIGH DEMAND');
  return badges;
}
