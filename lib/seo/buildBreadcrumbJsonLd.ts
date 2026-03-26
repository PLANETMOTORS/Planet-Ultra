const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.planetmotors.ca';

interface BreadcrumbItem {
  name: string;
  /** Root-relative path, e.g. "/" or "/inventory" */
  path: string;
}

/**
 * Builds a schema.org BreadcrumbList JSON-LD object.
 *
 * Usage on the canonical VDP page:
 *   buildBreadcrumbJsonLd([
 *     { name: 'Home', path: '/' },
 *     { name: 'Inventory', path: '/inventory' },
 *     { name: '2021 BMW X3', path: '/inventory/used/bmw/x3/some-slug' },
 *   ])
 */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
