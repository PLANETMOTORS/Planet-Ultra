/**
 * Shared canonical URL helpers.
 *
 * Canonical VDP route: /inventory/used/[make]/[model]/[slug]
 * Helper/redirect route: /inventory/[slug]  — never canonical
 */

/** Lowercase and hyphenate a raw segment for use in URL paths. */
export function toUrlSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Builds the canonical VDP path for a vehicle.
 * Returns a root-relative path: /inventory/used/[make]/[model]/[slug]
 */
export function buildCanonicalVdpPath(
  make: string,
  model: string,
  slug: string,
): string {
  return `/inventory/used/${toUrlSegment(make)}/${toUrlSegment(model)}/${slug}`;
}

/**
 * Builds the full canonical VDP URL including the site origin.
 */
export function buildCanonicalVdpUrl(
  siteUrl: string,
  make: string,
  model: string,
  slug: string,
): string {
  return `${siteUrl}${buildCanonicalVdpPath(make, model, slug)}`;
}
