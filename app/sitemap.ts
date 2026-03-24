import type { MetadataRoute } from 'next';
import { getCanonicalVehiclePaths } from '@/lib/data/vehicleQueries';
import { buildAbsoluteUrl } from '@/lib/site/config';
import { cacheProfiles } from '@/lib/site/cache';
import { buildInventoryPath } from '@/lib/site/routes';

export const revalidate = cacheProfiles.sitemap;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: buildAbsoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: buildAbsoluteUrl(buildInventoryPath()),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...getCanonicalVehiclePaths().map((path) => ({
      url: buildAbsoluteUrl(path),
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
