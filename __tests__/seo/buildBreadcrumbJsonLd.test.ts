import { describe, it, expect } from 'vitest';
import { buildBreadcrumbJsonLd } from '@/lib/seo/buildBreadcrumbJsonLd';

describe('buildBreadcrumbJsonLd', () => {
  it('returns schema.org BreadcrumbList type', () => {
    const ld = buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }]);
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('BreadcrumbList');
  });

  it('assigns correct positions (1-indexed)', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Inventory', path: '/inventory' },
      { name: '2024 BMW X3', path: '/inventory/used/bmw/x3/slug' },
    ]);
    const items = ld['itemListElement'] as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0]['position']).toBe(1);
    expect(items[1]['position']).toBe(2);
    expect(items[2]['position']).toBe(3);
  });

  it('each item has ListItem type', () => {
    const ld = buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }]);
    const items = ld['itemListElement'] as Array<Record<string, unknown>>;
    expect(items[0]['@type']).toBe('ListItem');
  });

  it('prepends site URL to paths', () => {
    const ld = buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }]);
    const items = ld['itemListElement'] as Array<Record<string, unknown>>;
    expect(items[0]['item']).toContain('https://');
    expect(String(items[0]['item']).endsWith('/')).toBe(true);
  });

  it('handles empty array', () => {
    const ld = buildBreadcrumbJsonLd([]);
    const items = ld['itemListElement'] as Array<Record<string, unknown>>;
    expect(items).toHaveLength(0);
  });
});
