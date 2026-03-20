import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetmotors.ca';

export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const title =
    vehicle.seoTitle ||
    `Used ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} for Sale | Planet Motors`;

  const description =
    vehicle.seoDescription ||
    `Shop this ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} with ${vehicle.mileageKm.toLocaleString()} km at Planet Motors.`;

  const canonicalUrl = `${SITE_URL}/inventory/${vehicle.slug}`;

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
