'use client';

interface Vehicle360VideoProps {
  src: string;
  poster?: string;
}

export function Vehicle360Video({ src, poster }: Vehicle360VideoProps) {
  return (
    <div className="media360-frame">
      <video
        className="media360-video"
        controls
        playsInline
        poster={poster}
        preload="none"
      >
        <source src={src} />
        Your browser does not support the 360 viewer.
      </video>
    </div>
  );
}
