import type { Vehicle, Vehicle360Asset, VehicleImage } from '@/types/vehicle';
import { siteConfig } from '@/lib/site/config';

const CLOUDINARY_HOSTNAME = 'res.cloudinary.com';
const DEFAULT_IMAGE_WIDTH = 1600;
const DEFAULT_IMAGE_HEIGHT = 900;

function isCloudinaryUrl(value?: string): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === CLOUDINARY_HOSTNAME;
  } catch {
    return false;
  }
}

export function getSafeCloudinaryImageUrl(value?: string): string {
  return isCloudinaryUrl(value) ? value : siteConfig.defaultOpenGraphImage;
}

export function getSafeCloudinaryVideoUrl(value?: string): string | undefined {
  return isCloudinaryUrl(value) ? value : undefined;
}

export function getImageDimensions(image?: VehicleImage): { width: number; height: number } {
  return {
    width: image?.width ?? DEFAULT_IMAGE_WIDTH,
    height: image?.height ?? DEFAULT_IMAGE_HEIGHT,
  };
}

export function getVehicleHeroImage(vehicle: Vehicle): VehicleImage {
  return {
    ...vehicle.heroImage,
    url: getSafeCloudinaryImageUrl(vehicle.heroImage?.url),
    width: vehicle.heroImage?.width ?? DEFAULT_IMAGE_WIDTH,
    height: vehicle.heroImage?.height ?? DEFAULT_IMAGE_HEIGHT,
  };
}

export function getVehicleGalleryImages(vehicle: Vehicle): VehicleImage[] {
  const galleryImages = vehicle.galleryImages?.length ? vehicle.galleryImages : [vehicle.heroImage];

  return galleryImages.map((image) => ({
    ...image,
    url: getSafeCloudinaryImageUrl(image.url),
    width: image.width ?? DEFAULT_IMAGE_WIDTH,
    height: image.height ?? DEFAULT_IMAGE_HEIGHT,
  }));
}

export function getVehicle360PosterImage(vehicle: Vehicle): VehicleImage {
  const posterUrl = vehicle.hero360Asset?.posterImageUrl || vehicle.heroImage.url;

  return {
    url: getSafeCloudinaryImageUrl(posterUrl),
    alt: vehicle.heroImage.alt,
    width: vehicle.heroImage.width ?? DEFAULT_IMAGE_WIDTH,
    height: vehicle.heroImage.height ?? DEFAULT_IMAGE_HEIGHT,
  };
}

export function getSafeVehicle360Asset(asset?: Vehicle360Asset): Vehicle360Asset | undefined {
  if (!asset) {
    return undefined;
  }

  const url = getSafeCloudinaryVideoUrl(asset.url);

  if (!url) {
    return undefined;
  }

  return {
    ...asset,
    url,
    posterImageUrl: getSafeCloudinaryImageUrl(asset.posterImageUrl),
  };
}
