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
  mileageKm: number;
  priceCad: number;
  status: VehicleStatus;
  heroImage: VehicleImage;
  gallery: VehicleImage[];
  media360?: Vehicle360Asset[];
  seoTitle?: string;
  seoDescription?: string;
}
