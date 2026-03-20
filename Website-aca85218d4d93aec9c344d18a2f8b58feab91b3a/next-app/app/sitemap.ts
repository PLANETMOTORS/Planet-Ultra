import type { MetadataRoute } from 'next';
import { getInventory } from '@/lib/inventory';
import { getSoldPhase, toISODate } from '@/lib/utils';
import { BASE_URL } from '@/lib/types';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = toISODate(new Date());

  // ── Static pages ─────────────────────────────────────────
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                                    lastModified: today, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/inventory/used/`,                     lastModified: today, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/inventory/used/electric/`,            lastModified: today, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/inventory/used/tesla/`,               lastModified: today, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/inventory/used/tesla/model-3/`,       lastModified: today, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/inventory/used/tesla/model-y/`,       lastModified: today, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/inventory/used/in-richmond-hill-on/`, lastModified: today, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/finance/`,                            lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/sell/`,                               lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about/`,                              lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact/`,                            lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq/`,                                lastModified: today, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/protection/`,                         lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/blog/`,                               lastModified: today, changeFrequency: 'weekly',  priority: 0.6 },
  ];

  // ── Dynamic VDP URLs — only Phase 1 (in stock) ───────────
  const inventory = await getInventory();
  const vdpUrls: MetadataRoute.Sitemap = inventory
    .filter(v => getSoldPhase(v.status, v.soldAt) === 1)
    .map(v => ({
      url:             `${BASE_URL}${v.canonicalPath}`,
      lastModified:    toISODate(v.updatedAt),
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    }));

  return [...staticUrls, ...vdpUrls];
}
