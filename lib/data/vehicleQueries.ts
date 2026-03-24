import type { Vehicle } from '@/types/vehicle';
import { vehicles } from '@/lib/data/vehicles';
import {
  buildVehicleCanonicalPath,
  matchesVehicleRoute,
  slugifyRouteSegment,
} from '@/lib/site/routes';

export function getAllVehicles(): Vehicle[] {
  return vehicles;
}

export function getFeaturedVehicles(): Vehicle[] {
  return vehicles.filter((vehicle) => vehicle.isFeatured);
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export function getVehicleByCanonicalSegments(
  makeSegment: string,
  modelSegment: string,
  slug: string,
): Vehicle | undefined {
  const vehicle = getVehicleBySlug(slug);

  if (!vehicle || !matchesVehicleRoute(vehicle, makeSegment, modelSegment)) {
    return undefined;
  }

  return vehicle;
}

export function getInventoryFilterOptions(): {
  makes: string[];
  bodyStyles: string[];
  fuelTypes: string[];
} {
  const makes = new Set<string>();
  const bodyStyles = new Set<string>();
  const fuelTypes = new Set<string>();

  for (const vehicle of vehicles) {
    makes.add(vehicle.make);

    if (vehicle.bodyStyle) {
      bodyStyles.add(vehicle.bodyStyle);
    }

    if (vehicle.fuelType) {
      fuelTypes.add(vehicle.fuelType);
    }
  }

  return {
    makes: [...makes].sort((left, right) => left.localeCompare(right)),
    bodyStyles: [...bodyStyles].sort((left, right) => left.localeCompare(right)),
    fuelTypes: [...fuelTypes].sort((left, right) => left.localeCompare(right)),
  };
}

export function getCanonicalVehiclePaths(): string[] {
  return vehicles.map((vehicle) => buildVehicleCanonicalPath(vehicle));
}

export function getInventoryMakeModelIndex(): Array<{
  make: string;
  makeSlug: string;
  model: string;
  modelSlug: string;
}> {
  const entries = new Map<string, { make: string; makeSlug: string; model: string; modelSlug: string }>();

  for (const vehicle of vehicles) {
    const makeSlug = slugifyRouteSegment(vehicle.make);
    const modelSlug = slugifyRouteSegment(vehicle.model);
    const key = `${makeSlug}:${modelSlug}`;

    if (!entries.has(key)) {
      entries.set(key, {
        make: vehicle.make,
        makeSlug,
        model: vehicle.model,
        modelSlug,
      });
    }
  }

  return [...entries.values()].sort((left, right) =>
    `${left.make} ${left.model}`.localeCompare(`${right.make} ${right.model}`),
  );
}
