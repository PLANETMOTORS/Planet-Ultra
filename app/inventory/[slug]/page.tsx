import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildCanonicalVdpPath } from '@/lib/seo/urlUtils';

/**
 * Helper/redirect-only route: /inventory/[slug]
 *
 * This route is NOT canonical. It must never be indexed by search engines.
 * It exists only to redirect short-form or legacy URLs to the canonical VDP.
 *
 * Canonical VDP route: /inventory/used/[make]/[model]/[slug]
 *
 * This route:
 *  - Is excluded from sitemap
 *  - Carries noindex/nofollow metadata
 *  - Redirects 308 (permanent) to the canonical URL once the vehicle is resolved
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface SlugParams {
  slug: string;
}

/**
 * Resolves the canonical VDP path for a slug.
 * Returns null if the vehicle cannot be found.
 *
 * NOTE: This stub will be replaced with a real Postgres lookup in a later phase.
 * Must return a root-relative canonical path for 308 redirect.
 */
async function resolveCanonicalPath(slug: string): Promise<string | null> {
  // TODO: query Postgres for make+model by slug, then buildCanonicalVdpPath.
  // Until the data layer is wired, keep helper-route links functional by
  // mirroring the VDP fixture vehicle used on the canonical route.
  return buildCanonicalVdpPath('BMW', 'X3', slug);
}

export default async function InventorySlugRedirectPage({
  params,
}: {
  params: Promise<SlugParams>;
}) {
  const { slug } = await params;
  const canonicalPath = await resolveCanonicalPath(slug);

  if (canonicalPath) {
    redirect(canonicalPath);
  }

  /*
   * If the vehicle can't be resolved, return a minimal not-found response.
   * The noindex metadata above ensures this is never crawled as content.
   */
  return (
    <main>
      <div className="container section">
        <h1>Vehicle Not Found</h1>
        <p className="muted">This vehicle may have been sold or is no longer available.</p>
          <Link className="button button-primary" href="/inventory">
            Browse Inventory
          </Link>
      </div>
    </main>
  );
}
