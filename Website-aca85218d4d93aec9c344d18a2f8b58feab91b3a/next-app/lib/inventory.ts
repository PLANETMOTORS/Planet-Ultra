// ============================================================
// Planet Motors — Combined Inventory Service
// ============================================================
// Merges HomeNet IOL + DriveEai feeds.
// Deduplication by VIN — DriveEai takes priority (richer data).
// Falls back to local INVENTORY array when both APIs are offline.
// Results are cached per request via Next.js fetch cache.
// ============================================================

import { fetchHomeNetInventory } from './homenet';
import { fetchDriveAiInventory, fetchDriveAiVehicle } from './driveai';
import { buildVdpPath, getSoldPhase, slugify } from './utils';
import type { Vehicle, InventoryFilters, InventoryPage } from './types';

// ── Local fallback inventory (matches existing SPA data) ─────
// This is used when both HomeNet and DriveEai APIs are unavailable.
// Remove this once live feeds are connected.
const FALLBACK_INVENTORY: Vehicle[] = [
  { id:'1',  stock:'PM73254025',  vin:'1C4JJXP6XMW777325',  year:2021, make:'Jeep',       model:'Wrangler 4xe',   trim:'Unlimited Sahara',     body:'SUV',   color:'Sarge Green',                 fuel:'plug-in hybrid', km:60950,  price:36200, biweekly:255, status:'available', images:[{url:'https://images.carpages.ca/inventory/13498070.788832287?w=640&h=480&q=75&s=bfd30b3d84de15595a20099aed7c8e2a', alt:'Front exterior view of Sarge Green 2021 Jeep Wrangler 4xe Unlimited Sahara for sale in Richmond Hill, ON', width:640, height:480}], description:'2021 Jeep Wrangler 4xe Unlimited Sahara · Sarge Green · 60,950 km', badges:['PHEV'], canonicalPath:buildVdpPath(2021,'Jeep','Wrangler 4xe','Unlimited Sahara','PM73254025'), source:'manual', updatedAt:'2026-03-14' },
  { id:'2',  stock:'PE26464022',  vin:'5YJ3E1EB6SF922646',  year:2025, make:'Tesla',      model:'Model 3',        trim:'Premium',              body:'Sedan', color:'Stealth Grey',                fuel:'electric',      km:45895,  price:53900, biweekly:375, status:'available', images:[{url:'https://images.carpages.ca/inventory/13705661', alt:'Front exterior view of Stealth Grey 2025 Tesla Model 3 Premium for sale in Richmond Hill, ON', width:640, height:480}], description:'2025 Tesla Model 3 Premium · Stealth Grey · 45,895 km', badges:['EV'], canonicalPath:buildVdpPath(2025,'Tesla','Model 3','Premium','PE26464022'), source:'manual', updatedAt:'2026-03-14' },
  { id:'3',  stock:'PE30884025',  vin:'7SAYGDEE1RF053088',  year:2024, make:'Tesla',      model:'Model Y',        trim:'Long Range',           body:'SUV',   color:'Solid Black',                 fuel:'electric',      km:39895,  price:51250, biweekly:360, status:'available', images:[{url:'https://images.carpages.ca/inventory/13705658', alt:'Front exterior view of Solid Black 2024 Tesla Model Y Long Range for sale in Richmond Hill, ON', width:640, height:480}], description:'2024 Tesla Model Y Long Range · Solid Black · 39,895 km', badges:['EV','LOW KM'], canonicalPath:buildVdpPath(2024,'Tesla','Model Y','Long Range','PE30884025'), source:'manual', updatedAt:'2026-03-14' },
  { id:'4',  stock:'PE87524015',  vin:'7SAYGDEF9NF308752',  year:2022, make:'Tesla',      model:'Model Y',        trim:'Performance',          body:'SUV',   color:'Solid Black',                 fuel:'electric',      km:37950,  price:44500, biweekly:310, status:'available', images:[{url:'https://images.carpages.ca/inventory/13695737', alt:'Front exterior view of Solid Black 2022 Tesla Model Y Performance for sale in Richmond Hill, ON', width:640, height:480}], description:'2022 Tesla Model Y Performance · Solid Black · 37,950 km', badges:['EV'], canonicalPath:buildVdpPath(2022,'Tesla','Model Y','Performance','PE87524015'), source:'manual', updatedAt:'2026-03-14' },
  { id:'5',  stock:'PE42524021',  vin:'5YJ3E1EB8SF894252',  year:2025, make:'Tesla',      model:'Model 3',        trim:'Premium',              body:'Sedan', color:'Deep Blue Metallic',          fuel:'electric',      km:57850,  price:49500, biweekly:345, status:'available', images:[{url:'https://images.carpages.ca/inventory/13695731', alt:'Front exterior view of Deep Blue Metallic 2025 Tesla Model 3 Premium for sale in Richmond Hill, ON', width:640, height:480}], description:'2025 Tesla Model 3 Premium · Deep Blue Metallic · 57,850 km', badges:['EV'], canonicalPath:buildVdpPath(2025,'Tesla','Model 3','Premium','PE42524021'), source:'manual', updatedAt:'2026-03-14' },
  { id:'11', stock:'PE64774011',  vin:'5YJSA1E64NF476477',  year:2022, make:'Tesla',      model:'Model S',        trim:'Plaid',                body:'Sedan', color:'Midnight Silver Metallic',    fuel:'electric',      km:35950,  price:89950, biweekly:630, status:'available', images:[{url:'https://images.carpages.ca/inventory/13607230', alt:'Front exterior view of Midnight Silver Metallic 2022 Tesla Model S Plaid for sale in Richmond Hill, ON', width:640, height:480}], description:'2022 Tesla Model S Plaid · Midnight Silver Metallic · 35,950 km', badges:['EV','LOW KM'], canonicalPath:buildVdpPath(2022,'Tesla','Model S','Plaid','PE64774011'), source:'manual', updatedAt:'2026-03-14' },
  { id:'12', stock:'PE77034007',  vin:'3GN7DSRR5SS127703',  year:2025, make:'Chevrolet',  model:'Equinox EV',     trim:'RS',                   body:'SUV',   color:'Iridescent Pearl Tricoat',    fuel:'electric',      km:12775,  price:44200, biweekly:310, status:'available', images:[{url:'https://images.carpages.ca/inventory/13594670', alt:'Front exterior view of Iridescent Pearl Tricoat 2025 Chevrolet Equinox EV RS for sale in Richmond Hill, ON', width:640, height:480}], description:'2025 Chevrolet Equinox EV RS · Iridescent Pearl Tricoat · 12,775 km', badges:['EV','LOW KM'], canonicalPath:buildVdpPath(2025,'Chevrolet','Equinox EV','RS','PE77034007'), source:'manual', updatedAt:'2026-03-14' },
  { id:'19', stock:'PE31383991',  vin:'KM8HC3A62SU023138',  year:2025, make:'Hyundai',    model:'Kona Electric',  trim:'Preferred',            body:'SUV',   color:'Cyber Grey',                  fuel:'electric',      km:15750,  price:36350, biweekly:255, status:'available', images:[{url:'https://images.carpages.ca/inventory/13539194.782684999?w=640&h=480&q=75&s=1377e63a1481239f6ab5592546ce4111', alt:'Front exterior view of Cyber Grey 2025 Hyundai Kona Electric Preferred for sale in Richmond Hill, ON', width:640, height:480}], description:'2025 Hyundai Kona Electric Preferred · Cyber Grey · 15,750 km', badges:['EV','LOW KM'], canonicalPath:buildVdpPath(2025,'Hyundai','Kona Electric','Preferred','PE31383991'), source:'manual', updatedAt:'2026-03-14' },
];

// ── Cache TTL (5 minutes in production) ─────────────────────
const CACHE_TTL = process.env.NODE_ENV === 'production' ? 300 : 60;

// ── Get full merged inventory ─────────────────────────────────
export async function getInventory(): Promise<Vehicle[]> {
  const [homenetVehicles, driveaiVehicles] = await Promise.allSettled([
    fetchHomeNetInventory(),
    fetchDriveAiInventory(),
  ]);

  const hn = homenetVehicles.status === 'fulfilled' ? homenetVehicles.value : [];
  const da = driveaiVehicles.status === 'fulfilled' ? driveaiVehicles.value : [];

  if (hn.length === 0 && da.length === 0) {
    console.warn('[Inventory] Both feeds empty — using fallback inventory');
    return FALLBACK_INVENTORY;
  }

  // Merge: DriveEai wins on duplicate VINs (richer AI data)
  const vinMap = new Map<string, Vehicle>();
  for (const v of hn) vinMap.set(v.vin, v);
  for (const v of da) vinMap.set(v.vin, v);  // overwrites HomeNet entry

  return Array.from(vinMap.values());
}

// ── Get single vehicle by slug ────────────────────────────────
export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  // Extract stock from end of slug (e.g. "2024-tesla-model-3-pe92904020" → "pe92904020")
  const parts = slug.split('-');
  const stock = parts[parts.length - 1].toUpperCase();

  // Try live feeds first
  const [hn, da] = await Promise.allSettled([
    import('./homenet').then(m => m.fetchHomeNetVehicle(stock)),
    fetchDriveAiVehicle(stock),
  ]);

  if (da.status === 'fulfilled' && da.value) return da.value;
  if (hn.status === 'fulfilled' && hn.value) return hn.value;

  // Fall back to local array
  return FALLBACK_INVENTORY.find(v => v.stock.toLowerCase() === stock.toLowerCase()) || null;
}

// ── Get filtered + paginated inventory ───────────────────────
export async function getFilteredInventory(filters: InventoryFilters): Promise<InventoryPage> {
  const all = await getInventory();

  // Only show Phase 1 vehicles on SRP (not sold)
  let results = all.filter(v => getSoldPhase(v.status, v.soldAt) === 1);

  if (filters.make)     results = results.filter(v => slugify(v.make)  === slugify(filters.make!));
  if (filters.model)    results = results.filter(v => slugify(v.model) === slugify(filters.model!));
  if (filters.fuel)     results = results.filter(v => v.fuel === filters.fuel);
  if (filters.body)     results = results.filter(v => slugify(v.body)  === slugify(filters.body!));
  if (filters.minPrice) results = results.filter(v => v.price >= filters.minPrice!);
  if (filters.maxPrice) results = results.filter(v => v.price <= filters.maxPrice!);
  if (filters.minYear)  results = results.filter(v => v.year  >= filters.minYear!);
  if (filters.maxYear)  results = results.filter(v => v.year  <= filters.maxYear!);

  const total      = results.length;
  const limit      = filters.limit || 12;
  const page       = filters.page  || 1;
  const totalPages = Math.ceil(total / limit);
  const start      = (page - 1) * limit;

  return {
    vehicles:   results.slice(start, start + limit),
    total,
    page,
    totalPages,
    filters,
  };
}

// ── Get all active VDP paths (for sitemap) ────────────────────
export async function getAllVdpPaths(): Promise<{ params: { slug: string; make: string; model: string } }[]> {
  const inventory = await getInventory();

  return inventory
    .filter(v => getSoldPhase(v.status, v.soldAt) === 1)
    .map(v => ({
      params: {
        make:  slugify(v.make),
        model: slugify(v.model),
        slug:  v.canonicalPath.split('/').filter(Boolean).pop() || '',
      },
    }));
}
