import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';
import { buildCanonicalVdpUrl } from './urlUtils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetmotors.ca';

/**
 * Builds Next.js Metadata for the canonical VDP route.
 * Canonical URL is always /inventory/used/[make]/[model]/[slug].
 * Must only be called from the canonical VDP page, never from helper/redirect routes.
 */
export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const title =
    vehicle.seoTitle ||
    `Used ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} for Sale | Planet Motors`;

  const description =
    vehicle.seoDescription ||
    `Shop this ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} with ${vehicle.mileageKm.toLocaleString()} km at Planet Motors.`;

  const canonicalUrl = buildCanonicalVdpUrl(SITE_URL, vehicle.make, vehicle.model, vehicle.slug);

  const heroImageUrl = vehicle.heroImage?.url;

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
      siteName: 'Planet Motors',
      type: 'website',
      images: heroImageUrl
        ? [
            {
              url: heroImageUrl,
              alt: vehicle.heroImage.alt || title,
              width: vehicle.heroImage.width,
              height: vehicle.heroImage.height,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImageUrl ? [heroImageUrl] : [],
    },
  };
}
