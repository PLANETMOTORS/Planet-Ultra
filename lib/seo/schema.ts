import { buildAbsoluteUrl } from '@/lib/site/config';
import { getVehicleHeroImage } from '@/lib/site/media';
import {
  buildInventoryPath,
  buildVehicleCanonicalPath,
  getVehicleDisplayName,
  getVehiclePrimaryPrice,
} from '@/lib/site/routes';
import { siteConfig } from '@/lib/site/config';
import type { Vehicle } from '@/types/vehicle';

type JsonLd = Record<string, unknown>;

export function buildHomeJsonLd(): JsonLd[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      name: siteConfig.name,
      url: buildAbsoluteUrl('/'),
      telephone: siteConfig.dealer.phone,
      address: {
        '@type': 'PostalAddress',
        ...siteConfig.dealer.address,
      },
      openingHours: siteConfig.dealer.openingHours,
      sameAs: siteConfig.dealer.sameAs,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: buildAbsoluteUrl('/'),
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${buildAbsoluteUrl(buildInventoryPath())}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function buildInventoryJsonLd(vehicles: Vehicle[]): JsonLd[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: buildAbsoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Inventory',
          item: buildAbsoluteUrl(buildInventoryPath()),
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: vehicles.map((vehicle, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: buildAbsoluteUrl(buildVehicleCanonicalPath(vehicle)),
        name: getVehicleDisplayName(vehicle),
      })),
    },
  ];
}

export function buildVehicleJsonLd(vehicle: Vehicle): JsonLd[] {
  const heroImage = getVehicleHeroImage(vehicle);
  const displayName = getVehicleDisplayName(vehicle);
  const canonicalUrl = buildAbsoluteUrl(buildVehicleCanonicalPath(vehicle));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: displayName,
      brand: {
        '@type': 'Brand',
        name: vehicle.make,
      },
      model: vehicle.model,
      vehicleModelDate: String(vehicle.year),
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: vehicle.mileageKm,
        unitCode: 'KMT',
      },
      vehicleIdentificationNumber: vehicle.vin,
      color: vehicle.exteriorColor,
      bodyType: vehicle.bodyStyle,
      fuelType: vehicle.fuelType,
      itemCondition: 'https://schema.org/UsedCondition',
      image: heroImage.url,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CAD',
        price: getVehiclePrimaryPrice(vehicle),
        availability:
          vehicle.status === 'sold'
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        url: canonicalUrl,
        seller: {
          '@type': 'AutoDealer',
          name: siteConfig.name,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: heroImage.url,
      caption: heroImage.alt || displayName,
      description: heroImage.alt || displayName,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: buildAbsoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Inventory',
          item: buildAbsoluteUrl(buildInventoryPath()),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: displayName,
          item: canonicalUrl,
        },
      ],
    },
  ];
}
