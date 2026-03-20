import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/inventory`, lastModified: new Date() },
  ];
}
