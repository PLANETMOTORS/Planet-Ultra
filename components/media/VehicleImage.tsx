import Image from 'next/image';
import type { VehicleImage as VehicleImageType } from '@/types/vehicle';
import { getImageDimensions, getSafeCloudinaryImageUrl } from '@/lib/site/media';

interface VehicleImageProps {
  image: VehicleImageType;
  alt: string;
  preload?: boolean;
  sizes: string;
  className?: string;
}

export function VehicleImage({
  image,
  alt,
  preload = false,
  sizes,
  className,
}: VehicleImageProps) {
  const dimensions = getImageDimensions(image);
  const src = getSafeCloudinaryImageUrl(image.url);

  return (
    <Image
      alt={alt}
      className={className}
      decoding="async"
      fetchPriority={preload ? 'high' : undefined}
      height={dimensions.height}
      loading={preload ? 'eager' : 'lazy'}
      preload={preload}
      sizes={sizes}
      src={src}
      width={dimensions.width}
    />
  );
}
