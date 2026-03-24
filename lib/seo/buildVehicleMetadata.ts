import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';
import { buildAbsoluteUrl, buildCanonicalVdpPath } from '@/lib/seo/routes';
import { isAllowedMediaUrl } from '@/lib/media/cloudinary';

export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const title =
    vehicle.seoTitle ||
    `Used ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} for Sale | Planet Motors`;

  const description =
    vehicle.seoDescription ||
    `Shop this ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''} with ${vehicle.mileageKm.toLocaleString()} km at Planet Motors.`;

  const canonicalUrl = buildAbsoluteUrl(buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug));
  const safeImageUrl = vehicle.heroImage?.url && isAllowedMediaUrl(vehicle.heroImage.url) ? vehicle.heroImage.url : null;

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
      images: safeImageUrl
        ? [
            {
              url: safeImageUrl,
              alt: vehicle.heroImage.alt || title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: safeImageUrl ? [safeImageUrl] : [],
    },
  };
}
