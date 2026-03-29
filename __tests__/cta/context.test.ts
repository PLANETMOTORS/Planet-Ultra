import { describe, it, expect } from 'vitest';
import {
  buildFinanceCtaUrl,
  buildPurchaseCtaUrl,
  buildTradeCtaUrl,
  parseVehicleCtaContext,
  type VehicleCtaContext,
} from '@/lib/cta/context';

const sampleCtx: VehicleCtaContext = {
  vehicleId: 'v-123',
  vehicleSlug: '2024-toyota-camry-le',
  vehicleYear: 2024,
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  vehiclePriceCad: 35000,
};

describe('buildFinanceCtaUrl', () => {
  it('starts with /finance?', () => {
    const url = buildFinanceCtaUrl(sampleCtx);
    expect(url).toMatch(/^\/finance\?/);
  });

  it('includes all required params', () => {
    const url = buildFinanceCtaUrl(sampleCtx);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('vid')).toBe('v-123');
    expect(params.get('slug')).toBe('2024-toyota-camry-le');
    expect(params.get('year')).toBe('2024');
    expect(params.get('make')).toBe('Toyota');
    expect(params.get('model')).toBe('Camry');
    expect(params.get('price')).toBe('35000');
  });
});

describe('buildPurchaseCtaUrl', () => {
  it('starts with /purchase?', () => {
    const url = buildPurchaseCtaUrl(sampleCtx);
    expect(url).toMatch(/^\/purchase\?/);
  });

  it('includes vid param', () => {
    const url = buildPurchaseCtaUrl(sampleCtx);
    expect(url).toContain('vid=v-123');
  });
});

describe('buildTradeCtaUrl', () => {
  it('starts with /sell-or-trade?', () => {
    const url = buildTradeCtaUrl(sampleCtx);
    expect(url).toMatch(/^\/sell-or-trade\?/);
  });
});

describe('parseVehicleCtaContext', () => {
  it('parses valid URLSearchParams', () => {
    const params = new URLSearchParams({
      vid: 'v-123',
      slug: '2024-toyota-camry-le',
      year: '2024',
      make: 'Toyota',
      model: 'Camry',
      price: '35000',
    });
    const result = parseVehicleCtaContext(params);
    expect(result).toEqual(sampleCtx);
  });

  it('parses valid Record<string, string>', () => {
    const record = {
      vid: 'v-123',
      slug: '2024-toyota-camry-le',
      year: '2024',
      make: 'Toyota',
      model: 'Camry',
      price: '35000',
    };
    const result = parseVehicleCtaContext(record);
    expect(result).toEqual(sampleCtx);
  });

  it('returns null when vid is missing', () => {
    const params = new URLSearchParams({ slug: 'x', year: '2024', make: 'X', model: 'Y', price: '1000' });
    expect(parseVehicleCtaContext(params)).toBeNull();
  });

  it('returns null when year is not a number', () => {
    const params = new URLSearchParams({
      vid: 'v-1', slug: 'x', year: 'abc', make: 'X', model: 'Y', price: '1000',
    });
    expect(parseVehicleCtaContext(params)).toBeNull();
  });

  it('returns null when year < 1900', () => {
    const params = new URLSearchParams({
      vid: 'v-1', slug: 'x', year: '1800', make: 'X', model: 'Y', price: '1000',
    });
    expect(parseVehicleCtaContext(params)).toBeNull();
  });

  it('returns null when price <= 0', () => {
    const params = new URLSearchParams({
      vid: 'v-1', slug: 'x', year: '2024', make: 'X', model: 'Y', price: '0',
    });
    expect(parseVehicleCtaContext(params)).toBeNull();
  });

  it('returns null when price is negative', () => {
    const params = new URLSearchParams({
      vid: 'v-1', slug: 'x', year: '2024', make: 'X', model: 'Y', price: '-1',
    });
    expect(parseVehicleCtaContext(params)).toBeNull();
  });

  it('round-trips through build and parse', () => {
    const url = buildFinanceCtaUrl(sampleCtx);
    const params = new URLSearchParams(url.split('?')[1]);
    const parsed = parseVehicleCtaContext(params);
    expect(parsed).toEqual(sampleCtx);
  });
});
