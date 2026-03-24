import type { MetadataRoute } from 'next';
import { REVALIDATE_SECONDS } from '@/lib/cache/policies';
import { getPublicInventoryVehicles } from '@/lib/data/vehicles';
import { buildAbsoluteUrl, buildCanonicalVdpPath } from '@/lib/seo/routes';

export const revalidate = REVALIDATE_SECONDS.sitemap;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getPublicInventoryVehicles();
  const canonicalVdpEntries: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
    url: buildAbsoluteUrl(buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug)),
    lastModified: vehicle.updatedAt ? new Date(vehicle.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: buildAbsoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: buildAbsoluteUrl('/inventory'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...canonicalVdpEntries,
  ];
}
