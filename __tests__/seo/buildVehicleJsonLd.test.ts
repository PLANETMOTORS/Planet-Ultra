import { describe, it, expect } from 'vitest';
import { buildVehicleJsonLd } from '@/lib/seo/buildVehicleJsonLd';
import type { Vehicle } from '@/types/vehicle';

function baseVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v-1',
    slug: '2024-toyota-camry-le',
    vin: '1HGBH41JXMN109186',
    stockNumber: 'STK-001',
    year: 2024,
    make: 'Toyota',
    model: 'Camry',
    trim: 'LE',
    mileageKm: 15000,
    priceCad: 35000,
    status: 'available',
    heroImage: { url: 'https://res.cloudinary.com/planet-motors/upload/v1/hero.jpg' },
    ...overrides,
  };
}

describe('buildVehicleJsonLd', () => {
  it('returns schema.org/Car type', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Car');
  });

  it('includes vehicle name with trim', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    expect(ld['name']).toBe('2024 Toyota Camry LE');
  });

  it('excludes trim from name when not present', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ trim: undefined }));
    expect(ld['name']).toBe('2024 Toyota Camry');
  });

  it('includes VIN', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    expect(ld['vehicleIdentificationNumber']).toBe('1HGBH41JXMN109186');
  });

  it('includes brand as schema.org Brand', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    const brand = ld['brand'] as Record<string, unknown>;
    expect(brand['@type']).toBe('Brand');
    expect(brand['name']).toBe('Toyota');
  });

  it('includes mileage with KMT unit code', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    const mileage = ld['mileageFromOdometer'] as Record<string, unknown>;
    expect(mileage['value']).toBe(15000);
    expect(mileage['unitCode']).toBe('KMT');
  });

  it('uses sale price when available', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ salePriceCad: 32000 }));
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['price']).toBe(32000);
  });

  it('falls back to regular price when no sale price', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ salePriceCad: undefined }));
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['price']).toBe(35000);
  });

  it('maps "available" status to InStock', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ status: 'available' }));
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['availability']).toBe('https://schema.org/InStock');
  });

  it('maps "pending" status to LimitedAvailability', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ status: 'pending' }));
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['availability']).toBe('https://schema.org/LimitedAvailability');
  });

  it('maps "reserved" status to LimitedAvailability', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ status: 'reserved' }));
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['availability']).toBe('https://schema.org/LimitedAvailability');
  });

  it('maps "sold" status to OutOfStock', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ status: 'sold' }));
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['availability']).toBe('https://schema.org/OutOfStock');
  });

  it('includes seller as AutoDealer', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    const offer = ld['offers'] as Record<string, unknown>;
    const seller = offer['seller'] as Record<string, unknown>;
    expect(seller['@type']).toBe('AutoDealer');
    expect(seller['name']).toBe('Planet Motors');
  });

  it('includes optional fields when present', () => {
    const ld = buildVehicleJsonLd(baseVehicle({
      exteriorColor: 'Red',
      bodyStyle: 'Sedan',
      fuelType: 'Gasoline',
      drivetrain: 'FWD',
      transmission: 'Automatic',
    }));
    expect(ld['color']).toBe('Red');
    expect(ld['bodyType']).toBe('Sedan');
    expect(ld['fuelType']).toBe('Gasoline');
    expect(ld['driveWheelConfiguration']).toBe('FWD');
    expect(ld['vehicleTransmission']).toBe('Automatic');
  });

  it('omits optional fields when not present', () => {
    const ld = buildVehicleJsonLd(baseVehicle({
      exteriorColor: undefined,
      bodyStyle: undefined,
    }));
    expect(ld).not.toHaveProperty('color');
    expect(ld).not.toHaveProperty('bodyType');
  });

  it('includes certified property when vehicle is certified', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ isCertified: true }));
    const prop = ld['additionalProperty'] as Record<string, unknown>;
    expect(prop['name']).toBe('certified');
    expect(prop['value']).toBe(true);
  });

  it('omits certified property when not certified', () => {
    const ld = buildVehicleJsonLd(baseVehicle({ isCertified: false }));
    expect(ld).not.toHaveProperty('additionalProperty');
  });

  it('includes hero image URL', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    expect(ld['image']).toContain('hero.jpg');
  });

  it('includes canonical URL', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    expect(ld['url']).toContain('/inventory/used/toyota/camry/');
  });

  it('uses CAD currency', () => {
    const ld = buildVehicleJsonLd(baseVehicle());
    const offer = ld['offers'] as Record<string, unknown>;
    expect(offer['priceCurrency']).toBe('CAD');
  });
});
