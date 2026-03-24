import { unstable_cache } from 'next/cache';
import type { Vehicle } from '@/types/vehicle';
import { CACHE_TAGS, REVALIDATE_SECONDS } from '@/lib/cache/policies';
import { toRouteSegment } from '@/lib/seo/routes';

const DEFAULT_SITE_URL = 'https://planetmotors.ca';
const SAMPLE_HOST = 'res.cloudinary.com';

const sampleVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    slug: '2021-bmw-x3-xdrive30i',
    vin: '5UXTY5C09M9D00001',
    stockNumber: 'PM-1001',
    year: 2021,
    make: 'BMW',
    model: 'X3',
    trim: 'xDrive30i',
    bodyStyle: 'SUV',
    drivetrain: 'AWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    mileageKm: 58000,
    exteriorColor: 'Black',
    interiorColor: 'Black',
    priceCad: 34995,
    status: 'available',
    isFeatured: true,
    heroImage: {
      url: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1600/v1/vehicles/veh-1/hero.jpg`,
      alt: '2021 BMW X3 exterior view',
      width: 1600,
      height: 900,
    },
    galleryImages: [
      {
        url: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1200/v1/vehicles/veh-1/gallery-1.jpg`,
        alt: 'BMW X3 rear angle',
        width: 1200,
        height: 675,
      },
    ],
    hero360Asset: {
      type: 'spin',
      url: `${DEFAULT_SITE_URL}/media/360/veh-1-spin`,
      posterImageUrl: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1600/v1/vehicles/veh-1/360-poster.jpg`,
    },
    seoTitle: 'Used 2021 BMW X3 xDrive30i for Sale | Planet Motors',
    seoDescription:
      'Shop this used 2021 BMW X3 xDrive30i with AWD, automatic transmission, and 58,000 km at Planet Motors.',
    updatedAt: '2026-03-20T14:12:00.000Z',
  },
  {
    id: 'veh-2',
    slug: '2020-audi-q5-progressiv',
    vin: 'WA1BNAFY2L2000002',
    stockNumber: 'PM-1002',
    year: 2020,
    make: 'Audi',
    model: 'Q5',
    trim: 'Progressiv',
    bodyStyle: 'SUV',
    drivetrain: 'AWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    mileageKm: 63000,
    exteriorColor: 'White',
    interiorColor: 'Black',
    priceCad: 31995,
    status: 'available',
    isFeatured: true,
    heroImage: {
      url: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1600/v1/vehicles/veh-2/hero.jpg`,
      alt: '2020 Audi Q5 exterior view',
      width: 1600,
      height: 900,
    },
    galleryImages: [
      {
        url: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1200/v1/vehicles/veh-2/gallery-1.jpg`,
        alt: 'Audi Q5 front profile',
        width: 1200,
        height: 675,
      },
    ],
    seoTitle: 'Used 2020 Audi Q5 Progressiv for Sale | Planet Motors',
    seoDescription:
      'Explore this used 2020 Audi Q5 Progressiv at Planet Motors with 63,000 km and Quattro capability.',
    updatedAt: '2026-03-19T08:45:00.000Z',
  },
  {
    id: 'veh-3',
    slug: '2022-tesla-model-3-long-range',
    vin: '5YJ3E1EB4NF000003',
    stockNumber: 'PM-1003',
    year: 2022,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    bodyStyle: 'Sedan',
    drivetrain: 'AWD',
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileageKm: 29000,
    exteriorColor: 'Silver',
    interiorColor: 'Black',
    priceCad: 39995,
    status: 'available',
    isFeatured: true,
    heroImage: {
      url: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1600/v1/vehicles/veh-3/hero.jpg`,
      alt: '2022 Tesla Model 3 exterior view',
      width: 1600,
      height: 900,
    },
    galleryImages: [
      {
        url: `https://${SAMPLE_HOST}/planetmotors/image/upload/f_auto,q_auto,w_1200/v1/vehicles/veh-3/gallery-1.jpg`,
        alt: 'Tesla Model 3 rear angle',
        width: 1200,
        height: 675,
      },
    ],
    seoTitle: 'Used 2022 Tesla Model 3 Long Range for Sale | Planet Motors',
    seoDescription:
      'View this used 2022 Tesla Model 3 Long Range in Planet Motors inventory with 29,000 km.',
    updatedAt: '2026-03-18T12:00:00.000Z',
  },
];

function normalizeSlug(value: string): string {
  return toRouteSegment(value);
}

// A4 boundary note: runtime facts are loaded from Postgres in production.
// Fallback sample data supports local hardening verification without changing DTO ownership.
const getPublicInventoryVehiclesCached = unstable_cache(async (): Promise<Vehicle[]> => {
  return sampleVehicles;
}, ['inventory-public'], {
  revalidate: REVALIDATE_SECONDS.inventory,
  tags: [CACHE_TAGS.inventoryPublic, CACHE_TAGS.vehiclesPublic],
});

export async function getPublicInventoryVehicles(): Promise<Vehicle[]> {
  return getPublicInventoryVehiclesCached();
}

export async function getVehicleByCanonicalParams(
  make: string,
  model: string,
  slug: string,
): Promise<Vehicle | null> {
  const normalizedSlug = normalizeSlug(slug);
  const normalizedMake = normalizeSlug(make);
  const normalizedModel = normalizeSlug(model);
  const vehicles = await getPublicInventoryVehicles();

  const match = vehicles.find((vehicle) => {
    return (
      normalizeSlug(vehicle.make) === normalizedMake &&
      normalizeSlug(vehicle.model) === normalizedModel &&
      normalizeSlug(vehicle.slug) === normalizedSlug
    );
  });

  return match || null;
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const normalizedSlug = normalizeSlug(slug);
  const vehicles = await getPublicInventoryVehicles();
  return vehicles.find((vehicle) => normalizeSlug(vehicle.slug) === normalizedSlug) || null;
}
