import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetmotors.ca';

export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const titleVehicle = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;

  const title =
    vehicle.seoTitle ||
    `${titleVehicle} — Planet Motors Richmond Hill`;

  const description =
    vehicle.seoDescription ||
    `${titleVehicle} with ${vehicle.mileageKm.toLocaleString()} km. View photos, pricing, and book a test drive at Planet Motors.`;

  const make = vehicle.make.toLowerCase().replace(/\s+/g, '-');
  const model = vehicle.model.toLowerCase().replace(/\s+/g, '-');
  const canonicalUrl = `${SITE_URL}/inventory/used/${make}/${model}/${vehicle.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: vehicle.heroImage?.url
        ? [
            {
              url: vehicle.heroImage.url,
              alt: vehicle.heroImage.alt || title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: vehicle.heroImage?.url ? [vehicle.heroImage.url] : [],
    },
  };
}
