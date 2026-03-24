import type { Vehicle } from '@/types/vehicle';
import { buildAbsoluteUrl, buildCanonicalVdpPath, getSiteUrl } from '@/lib/seo/routes';
import { filterAllowedMediaUrls } from '@/lib/media/cloudinary';

type JsonLd = Record<string, unknown>;

const DEALER_NAME = 'Planet Motors';
const DEALER_LOGO = '/logo.png';
const DEALER_PHONE = '+1-905-000-0000';

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function vehicleName(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;
}

export function buildOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: DEALER_NAME,
    url: getSiteUrl(),
    logo: buildAbsoluteUrl(DEALER_LOGO),
    telephone: DEALER_PHONE,
  };
}

export function buildHomeJsonLd(): JsonLd[] {
  return [
    buildOrganizationJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: DEALER_NAME,
      url: getSiteUrl(),
      potentialAction: {
        '@type': 'SearchAction',
        target: `${buildAbsoluteUrl('/inventory')}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function buildInventoryJsonLd(vehicles: Vehicle[]): JsonLd[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Used Vehicle Inventory | Planet Motors',
      url: buildAbsoluteUrl('/inventory'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: vehicles.slice(0, 24).map((vehicle, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: buildAbsoluteUrl(buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug)),
          name: vehicleName(vehicle),
        })),
      },
    },
  ];
}

function resolveAvailability(status: Vehicle['status']): string {
  if (status === 'available') return 'https://schema.org/InStock';
  if (status === 'pending' || status === 'reserved') return 'https://schema.org/LimitedAvailability';
  return 'https://schema.org/OutOfStock';
}

export function buildVehicleJsonLd(vehicle: Vehicle): JsonLd[] {
  const canonicalUrl = buildAbsoluteUrl(buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug));
  const dateModified = toIsoDate(vehicle.updatedAt);
  const mediaUrls = filterAllowedMediaUrls([vehicle.heroImage?.url || '']);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: vehicleName(vehicle),
      brand: vehicle.make,
      model: vehicle.model,
      vehicleModelDate: String(vehicle.year),
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: vehicle.mileageKm,
        unitCode: 'KMT',
      },
      color: vehicle.exteriorColor,
      image: mediaUrls,
      url: canonicalUrl,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CAD',
        price: vehicle.salePriceCad ?? vehicle.priceCad,
        availability: resolveAvailability(vehicle.status),
        url: canonicalUrl,
      },
      dateModified,
    },
    buildOrganizationJsonLd(),
  ];
}
