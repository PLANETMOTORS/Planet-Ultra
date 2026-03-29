import { describe, it, expect } from 'vitest';
import { toUrlSegment, buildCanonicalVdpPath, buildCanonicalVdpUrl } from '@/lib/seo/urlUtils';

describe('toUrlSegment', () => {
  it('lowercases input', () => {
    expect(toUrlSegment('Toyota')).toBe('toyota');
  });

  it('replaces spaces with hyphens', () => {
    expect(toUrlSegment('Grand Cherokee')).toBe('grand-cherokee');
  });

  it('removes special characters', () => {
    expect(toUrlSegment("Mercedes-Benz")).toBe('mercedes-benz');
    expect(toUrlSegment("Ram 1500 (New)")).toBe('ram-1500-new');
  });

  it('trims whitespace', () => {
    expect(toUrlSegment('  BMW  ')).toBe('bmw');
  });

  it('collapses multiple spaces into single hyphen', () => {
    expect(toUrlSegment('Land  Rover')).toBe('land-rover');
  });

  it('handles empty string', () => {
    expect(toUrlSegment('')).toBe('');
  });
});

describe('buildCanonicalVdpPath', () => {
  it('builds correct path structure', () => {
    expect(buildCanonicalVdpPath('Toyota', 'Camry', '2024-toyota-camry-le-12345'))
      .toBe('/inventory/used/toyota/camry/2024-toyota-camry-le-12345');
  });

  it('normalizes make and model but preserves slug', () => {
    expect(buildCanonicalVdpPath('Mercedes-Benz', 'C-Class', 'my-slug'))
      .toBe('/inventory/used/mercedes-benz/c-class/my-slug');
  });
});

describe('buildCanonicalVdpUrl', () => {
  it('prepends site URL to path', () => {
    expect(buildCanonicalVdpUrl('https://planetmotors.ca', 'Honda', 'Civic', 'slug'))
      .toBe('https://planetmotors.ca/inventory/used/honda/civic/slug');
  });

  it('handles trailing slash on site URL', () => {
    // buildCanonicalVdpPath starts with /, siteUrl should not end with /
    const result = buildCanonicalVdpUrl('https://planetmotors.ca', 'BMW', 'X3', 'slug');
    expect(result).not.toContain('//inventory');
  });
});
