export const CACHE_TAGS = {
  inventoryPublic: 'inventory-public',
  vehiclesPublic: 'vehicles-public',
  sitemapPublic: 'sitemap-public',
} as const;

export const REVALIDATE_SECONDS = {
  home: 300,
  inventory: 120,
  vdp: 120,
  sitemap: 1800,
} as const;
