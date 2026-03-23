export type VehicleStatus = 'available' | 'pending' | 'reserved' | 'sold';

export interface VehicleImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Vehicle360Asset {
  type: 'spin' | 'interior' | 'glb';
  url: string;
  posterImageUrl?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  vin: string;
  stockNumber: string;

  year: number;
  make: string;
  model: string;
  trim?: string;

  bodyStyle?: string;
  drivetrain?: string;
  fuelType?: string;
  transmission?: string;

  mileageKm: number;

  exteriorColor?: string;
  interiorColor?: string;

  priceCad: number;
  salePriceCad?: number;

  status: VehicleStatus;

  isFeatured?: boolean;
  isCertified?: boolean;

  heroImage: VehicleImage;
  galleryImages?: VehicleImage[];
  hero360Asset?: Vehicle360Asset;

  description?: string;
  featureBullets?: string[];
  packages?: string[];
  options?: string[];

  seoTitle?: string;
  seoDescription?: string;

  createdAt?: string;
  updatedAt?: string;
}
