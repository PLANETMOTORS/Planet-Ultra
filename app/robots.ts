import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetmotors.ca';

/**
 * The Host directive takes a bare hostname (no protocol, no trailing slash).
 * Extract it from SITE_URL so it stays in sync with the env var.
 */
const SITE_HOST = new URL(SITE_URL).host;

/**
 * Robots.txt rules:
 * - Public surfaces: homepage, inventory listing, canonical VDP, sell-or-trade, finance → allowed.
 * - Helper/redirect route /inventory/[slug] → disallowed (never canonical).
 * - API routes → disallowed.
 * - Admin/internal routes → disallowed.
 * - _next/static and _next/image served by Next but not page content → disallowed for crawlers.
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
    host: SITE_HOST,
  };
}
