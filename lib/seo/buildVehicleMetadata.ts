import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';
import { buildCanonicalVdpUrl } from './urlUtils';
import { socialCardImageUrl, SOCIAL_CARD_DIMS } from '@/lib/media/cloudinary';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.planetmotors.ca';

/**
 * Builds Next.js Metadata for the canonical VDP route.
 * Canonical URL is always /inventory/used/[make]/[model]/[slug].
 * Must only be called from the canonical VDP page, never from helper/redirect routes.
 *
 * OG image is always the 1200×630 social-card Cloudinary transform.
 * Twitter image uses the same URL (summary_large_image accepts JPEG).
 */
export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const title =
    vehicle.seoTitle ||
    `Used ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} for Sale | Planet Motors`;

  const description =
    vehicle.seoDescription ||
    `Shop this ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} with ${vehicle.mileageKm.toLocaleString()} km at Planet Motors.`;

  const canonicalUrl = buildCanonicalVdpUrl(SITE_URL, vehicle.make, vehicle.model, vehicle.slug);

  const rawHeroUrl = vehicle.heroImage?.url;

  /*
   * Always apply the 1200×630 social-card transform for OG/Twitter.
   * `socialCardImageUrl` is a no-op for non-Cloudinary URLs (dev/staging sources
   * without /upload/ in the path), so the raw URL is returned as-is in those cases.
   */
  const ogImageUrl = rawHeroUrl ? socialCardImageUrl(rawHeroUrl) : undefined;

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
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              alt: vehicle.heroImage.alt || title,
              width: SOCIAL_CARD_DIMS.width,
              height: SOCIAL_CARD_DIMS.height,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
