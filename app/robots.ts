import type { MetadataRoute } from 'next';
import { buildAbsoluteUrl, siteConfig } from '@/lib/site/config';
import { cacheProfiles } from '@/lib/site/cache';

export const revalidate = cacheProfiles.robots;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/inventory', '/inventory/used/'],
        disallow: ['/inventory/*?*', '/api/', '/_next/'],
      },
    ],
    sitemap: buildAbsoluteUrl('/sitemap.xml'),
    host: siteConfig.siteUrl,
  };
}
