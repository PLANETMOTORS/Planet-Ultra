import type { Metadata } from 'next';
import type { Vehicle } from '@/types/vehicle';

export function buildVehicleMetadata(vehicle: Vehicle): Metadata {
  const title = vehicle.seoTitle || `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale | Planet Motors`;
  const description = vehicle.seoDescription || `Shop this ${vehicle.year} ${vehicle.make} ${vehicle.model} at Planet Motors.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [vehicle.heroImage.url],
    },
    alternates: {
      canonical: `/vehicle/${vehicle.slug}`,
    },
  };
}
