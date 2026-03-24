'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import type { Vehicle360Asset, VehicleImage } from '@/types/vehicle';

const Vehicle360Video = dynamic(
  () => import('@/components/media/Vehicle360Video').then((module) => module.Vehicle360Video),
  {
    ssr: false,
    loading: () => null,
  },
);

interface Vehicle360ViewerProps {
  asset?: Vehicle360Asset;
  poster: VehicleImage;
  label: string;
}

export function Vehicle360Viewer({ asset, poster, label }: Vehicle360ViewerProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  if (!asset) {
    return null;
  }

  if (!isHydrated) {
    return (
      <button
        type="button"
        className="media360-poster"
        onClick={() => setIsHydrated(true)}
        aria-label={`Load 360 view for ${label}`}
      >
        <Image
          src={poster.url}
          alt={poster.alt || `${label} 360 poster image`}
          width={poster.width ?? 1600}
          height={poster.height ?? 900}
          sizes="(min-width: 960px) 40vw, 100vw"
        />
        <span className="media360-overlay">Load 360 view</span>
      </button>
    );
  }

  if (asset.type === 'glb') {
    return (
      <div className="media360-frame" role="status" aria-live="polite">
        <p className="muted">
          360 model assets stay isolated from first render. This placeholder reserves space for the
          runtime viewer.
        </p>
      </div>
    );
  }

  return <Vehicle360Video poster={asset.posterImageUrl} src={asset.url} />;
}
