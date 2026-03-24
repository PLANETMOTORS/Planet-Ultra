import type { Vehicle } from '@/types/vehicle';

export function slugifyRouteSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildVehicleCanonicalPath(vehicle: Vehicle): string {
  return `/inventory/used/${slugifyRouteSegment(vehicle.make)}/${slugifyRouteSegment(vehicle.model)}/${vehicle.slug}`;
}

export function buildVehicleHelperPath(vehicle: Vehicle): string {
  return `/inventory/${vehicle.slug}`;
}

export function buildInventoryPath(): string {
  return '/inventory';
}

export function buildInventoryMakeModelPath(make: string, model: string): string {
  return `/inventory/used/${slugifyRouteSegment(make)}/${slugifyRouteSegment(model)}`;
}

export function getVehicleDisplayName(vehicle: Vehicle): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
}

export function getVehiclePrimaryPrice(vehicle: Vehicle): number {
  return vehicle.salePriceCad ?? vehicle.priceCad;
}

export function matchesVehicleRoute(vehicle: Vehicle, make: string, model: string): boolean {
  return (
    slugifyRouteSegment(vehicle.make) === make &&
    slugifyRouteSegment(vehicle.model) === model
  );
}
