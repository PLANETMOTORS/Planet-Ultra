import type { Vehicle } from '@/types/vehicle';
import { vehicles } from './vehicles';

export function getAllVehicles(): Vehicle[] {
  return vehicles;
}

export function getFeaturedVehicles(): Vehicle[] {
  return vehicles.filter((vehicle) => vehicle.isFeatured);
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
