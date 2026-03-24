import type { MetadataRoute } from 'next';
import { buildAbsoluteUrl, siteConfig } from '@/lib/site/config';

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
