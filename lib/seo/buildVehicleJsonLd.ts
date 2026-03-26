import type { Vehicle } from '@/types/vehicle';
import { buildCanonicalVdpUrl } from './urlUtils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.planetmotors.ca';

/**
 * Builds a schema.org/Car (plus OfferShipping) JSON-LD object for a vehicle.
 * Must only be embedded on the canonical VDP page.
 */
export function buildVehicleJsonLd(vehicle: Vehicle): Record<string, unknown> {
  const canonicalUrl = buildCanonicalVdpUrl(SITE_URL, vehicle.make, vehicle.model, vehicle.slug);

  const offerPrice = vehicle.salePriceCad ?? vehicle.priceCad;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
    url: canonicalUrl,
    vehicleIdentificationNumber: vehicle.vin,
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    model: vehicle.model,
    modelDate: String(vehicle.year),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileageKm,
      unitCode: 'KMT',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      price: offerPrice,
      availability:
        vehicle.status === 'available'
          ? 'https://schema.org/InStock'
          : vehicle.status === 'pending' || vehicle.status === 'reserved'
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'Planet Motors',
        url: SITE_URL,
      },
    },
  };

  if (vehicle.exteriorColor) {
    jsonLd['color'] = vehicle.exteriorColor;
  }

  if (vehicle.bodyStyle) {
    jsonLd['bodyType'] = vehicle.bodyStyle;
  }

  if (vehicle.fuelType) {
    jsonLd['fuelType'] = vehicle.fuelType;
  }

  if (vehicle.drivetrain) {
    jsonLd['driveWheelConfiguration'] = vehicle.drivetrain;
  }

  if (vehicle.transmission) {
    jsonLd['vehicleTransmission'] = vehicle.transmission;
  }

  if (vehicle.heroImage?.url) {
    jsonLd['image'] = vehicle.heroImage.url;
  }

  if (vehicle.isCertified) {
    jsonLd['additionalProperty'] = {
      '@type': 'PropertyValue',
      name: 'certified',
      value: true,
    };
  }

  return jsonLd;
}
