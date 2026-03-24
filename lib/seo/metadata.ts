import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';
import { buildAbsoluteUrl, siteConfig } from '@/lib/site/config';
import { getVehicleHeroImage } from '@/lib/site/media';
import {
  buildInventoryPath,
  buildVehicleCanonicalPath,
  getVehicleDisplayName,
  getVehiclePrimaryPrice,
} from '@/lib/site/routes';

function buildRobots(noindex: boolean): Metadata['robots'] {
  if (!noindex) {
    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    };
  }

  return {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

function buildBaseOpenGraph(path: string, title: string, description: string): NonNullable<Metadata['openGraph']> {
  return {
    title,
    description,
    url: buildAbsoluteUrl(path),
    locale: siteConfig.ogLocale,
    siteName: siteConfig.name,
    type: 'website',
    images: [
      {
        url: siteConfig.defaultOpenGraphImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  };
}

export function buildHomeMetadata(): Metadata {
  const title = `${siteConfig.name} | Used EVs, Teslas, and Premium Vehicles in Richmond Hill`;
  const description =
    'Browse used EVs, Teslas, SUVs, and premium vehicles from Planet Motors in Richmond Hill, Ontario.';

  return {
    title,
    description,
    alternates: {
      canonical: buildAbsoluteUrl('/'),
    },
    robots: buildRobots(false),
    openGraph: buildBaseOpenGraph('/', title, description),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: siteConfig.socialHandle,
      site: siteConfig.socialHandle,
      images: [siteConfig.defaultOpenGraphImage],
    },
  };
}

export function buildInventoryMetadata(options?: {
  query?: string;
  filtersApplied?: boolean;
  vehicleCount?: number;
}): Metadata {
  const title = `Used Inventory | ${siteConfig.name}`;
  const description =
    options?.query && options.query.trim().length > 0
      ? `Browse ${siteConfig.name} inventory results for "${options.query.trim()}".`
      : 'Browse used EVs, Teslas, SUVs, and premium vehicles at Planet Motors.';

  return {
    title,
    description,
    alternates: options?.filtersApplied
      ? undefined
      : {
          canonical: buildAbsoluteUrl(buildInventoryPath()),
        },
    robots: buildRobots(Boolean(options?.filtersApplied)),
    openGraph: buildBaseOpenGraph(buildInventoryPath(), title, description),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: siteConfig.socialHandle,
      site: siteConfig.socialHandle,
      images: [siteConfig.defaultOpenGraphImage],
    },
  };
}

export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const displayName = getVehicleDisplayName(vehicle);
  const canonicalPath = buildVehicleCanonicalPath(vehicle);
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const price = getVehiclePrimaryPrice(vehicle).toLocaleString('en-CA');
  const heroImage = getVehicleHeroImage(vehicle);
  const title =
    vehicle.seoTitle || `${displayName} for Sale in Richmond Hill | ${siteConfig.name}`;
  const description =
    vehicle.seoDescription ||
    `Shop this ${displayName} with ${vehicle.mileageKm.toLocaleString('en-CA')} km and pricing from $${price} CAD at ${siteConfig.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: buildRobots(false),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: siteConfig.ogLocale,
      siteName: siteConfig.name,
      type: 'website',
      images: [
        {
          url: heroImage.url,
          width: heroImage.width,
          height: heroImage.height,
          alt: heroImage.alt || displayName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: siteConfig.socialHandle,
      site: siteConfig.socialHandle,
      images: [heroImage.url],
    },
  };
}
