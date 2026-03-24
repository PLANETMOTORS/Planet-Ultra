const DEFAULT_SITE_URL = 'https://planetmotors.ca';

export const CANONICAL_VDP_BASE_PATH = '/inventory/used';

export function getSiteUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    const normalized = new URL(rawUrl);
    return normalized.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function toRouteSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCanonicalVdpPath(make: string, model: string, slug: string): string {
  const safeMake = toRouteSegment(make);
  const safeModel = toRouteSegment(model);
  const safeSlug = toRouteSegment(slug);
  return `${CANONICAL_VDP_BASE_PATH}/${safeMake}/${safeModel}/${safeSlug}`;
}

export function buildAbsoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString();
}
