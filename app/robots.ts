import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.planetmotors.ca';

/**
 * Robots.txt rules:
 * - Public surfaces: homepage, inventory listing, canonical VDP, sell-or-trade, finance → allowed.
 * - Helper/redirect route /inventory/[slug] → disallowed (never canonical).
 * - API routes → disallowed.
 * - Admin/internal routes → disallowed.
 * - _next/static and _next/image served by Next but not page content → disallowed for crawlers.
 *
 * Host directive is omitted: Next.js MetadataRoute.Robots passes the value through
 * verbatim with no reliable protocol-stripping, and the Sitemap line already
 * establishes the canonical origin for crawlers that support it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/inventory',
          '/inventory/used/',
          '/sell-or-trade',
          '/finance',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/inventory/$',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
