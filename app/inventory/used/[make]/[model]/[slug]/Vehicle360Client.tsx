'use client';

import { useState } from 'react';
import type { Vehicle360Asset } from '@/types/vehicle';
import { isAllowedMediaUrl, isSafeIframeUrl } from '@/lib/media/cloudinary';

interface Vehicle360ClientProps {
  asset: Vehicle360Asset;
}

export function Vehicle360Client({ asset }: Vehicle360ClientProps) {
  const [hydrated, setHydrated] = useState(false);
  const posterUrl = asset.posterImageUrl && isAllowedMediaUrl(asset.posterImageUrl) ? asset.posterImageUrl : null;
  const iframeUrl = isSafeIframeUrl(asset.url) ? asset.url : null;

  return (
    <div style={{ marginTop: 12 }}>
      {!hydrated ? (
        <>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="360 spin preview poster"
              width={1600}
              height={900}
              loading="lazy"
              style={{ width: '100%', height: 'auto', borderRadius: 12 }}
            />
          ) : null}
          <div style={{ marginTop: 12 }}>
            <button className="button button-secondary" onClick={() => setHydrated(true)} type="button">
              Load 360 view
            </button>
          </div>
        </>
      ) : iframeUrl ? (
        <iframe
          src={iframeUrl}
          title="Vehicle 360 interactive media"
          loading="lazy"
          style={{ width: '100%', minHeight: 420, border: 0, borderRadius: 12 }}
          allow="fullscreen"
        />
      ) : (
        <p className="muted">360 media URL is unavailable.</p>
      )}
      <p className="muted">360 remains outside critical render path with poster-first click-to-hydrate behavior.</p>
    </div>
  );
}
