import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.planetmotors.ca';

/**
 * Sitemap rules:
 * - Only canonical, publicly accessible routes are included.
 * - Helper/redirect routes (e.g. /inventory/[slug]) are EXCLUDED.
 * - VDP entries use the canonical nested URL: /inventory/used/[make]/[model]/[slug]
 * - Non-public routes (/api/*, /admin/*, etc.) are never included.
 *
 * Vehicle VDP entries will be dynamically appended once Postgres is connected.
 * The stub array below is the safe placeholder; add entries alongside it.
 */

/**
 * Fetches canonical VDP URLs from Postgres.
 * Returns an empty array until the data layer is wired.
 *
 * NOTE: Replace this stub with a real Postgres query in a later phase.
 * The function must return objects with at minimum a `url` field.
 */
async function getCanonicalVdpUrls(): Promise<
  { url: string; lastModified?: Date }[]
> {
  // TODO: query Postgres for available+reserved vehicles and map to canonical VDP URLs:
  //   SELECT make, model, slug, updated_at FROM vehicles WHERE status IN ('available','reserved')
  //   map each row: buildCanonicalVdpUrl(SITE_URL, row.make, row.model, row.slug)
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sell-or-trade`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/finance`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const vdpEntries = await getCanonicalVdpUrls();
  const vdpRoutes: MetadataRoute.Sitemap = vdpEntries.map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified ?? new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...vdpRoutes];
}
