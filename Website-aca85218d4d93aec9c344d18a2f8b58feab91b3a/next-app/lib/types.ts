// ============================================================
// Planet Motors — Shared TypeScript Types
// ============================================================

export interface VehicleImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  view?: 'exterior' | 'interior' | 'detail';
  sequence?: number;
}

export interface Vehicle {
  // Core identity
  id: string;               // Unique internal ID
  stock: string;            // Stock number (e.g. PE26464022)
  vin: string;              // VIN

  // Vehicle specs
  year: number;
  make: string;
  model: string;
  trim: string;
  body: string;             // SUV, Sedan, Hatchback, etc.
  color: string;            // Exterior color
  colorInt?: string;        // Interior color
  fuel: 'electric' | 'hybrid' | 'plug-in hybrid' | 'gasoline' | 'diesel';
  transmission?: string;
  drivetrain?: string;      // AWD, RWD, FWD
  engine?: string;
  doors?: number;
  seats?: number;
  km: number;               // Odometer in km

  // EV-specific
  evRange?: number;         // km range (EPA estimated)
  batteryCapacity?: number; // kWh

  // Pricing
  price: number;            // CAD
  biweekly: number;         // Bi-weekly payment estimate
  was?: number;             // Previous price (for price drop badge)

  // Status + lifecycle
  status: 'available' | 'sold' | 'pending';
  soldAt?: string;          // ISO date string — used for sold lifecycle phase

  // Media
  images: VehicleImage[];   // Ordered array, index 0 = hero image

  // Content
  description: string;
  badges?: string[];        // EV, LOW KM, PERFORMANCE, etc.
  features?: string[];

  // URLs
  canonicalPath: string;    // e.g. /inventory/used/tesla/model-3/2024-tesla-model-3-pe92904020/

  // Source tracking
  source: 'homenet' | 'driveai' | 'manual';
  updatedAt: string;        // ISO date — for sitemap lastmod
}

export interface InventoryFilters {
  make?: string;
  model?: string;
  fuel?: string;
  body?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  city?: string;
  page?: number;
  limit?: number;
}

export interface InventoryPage {
  vehicles: Vehicle[];
  total: number;
  page: number;
  totalPages: number;
  filters: InventoryFilters;
}

export interface DealerInfo {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  omvic: string;
  hours: { day: string; hours: string }[];
}

export const DEALER: DealerInfo = {
  name:       'Planet Motors',
  address:    '30 Major Mackenzie Dr E',
  city:       'Richmond Hill',
  province:   'ON',
  postalCode: 'L4C 1G7',
  phone:      '+14169852277',
  email:      'info@planetmotors.app',
  lat:        43.8758,
  lng:        -79.4378,
  omvic:      '5482807',
  hours: [
    { day: 'Monday',    hours: '10:00 AM – 6:00 PM' },
    { day: 'Tuesday',   hours: '10:00 AM – 6:00 PM' },
    { day: 'Wednesday', hours: '10:00 AM – 6:00 PM' },
    { day: 'Thursday',  hours: '10:00 AM – 6:00 PM' },
    { day: 'Friday',    hours: '10:00 AM – 6:00 PM' },
    { day: 'Saturday',  hours: '10:00 AM – 5:00 PM' },
    { day: 'Sunday',    hours: 'Closed' },
  ],
};

export const BASE_URL = 'https://www.planetmotors.app';
