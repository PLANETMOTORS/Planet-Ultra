import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    /**
     * Restrict remote image sources to Cloudinary and controlled origins.
     * The wildcard hostnames from the initial config are replaced to prevent
     * arbitrary external image proxying.
     *
     * Rules:
     * - res.cloudinary.com — Cloudinary delivery (primary vehicle media CDN)
     * - During development/staging, set NEXT_PUBLIC_ALLOW_ALL_IMAGE_HOSTS=1
     *   to re-enable broad patterns without touching this file.
     */
    remotePatterns:
      process.env.NEXT_PUBLIC_ALLOW_ALL_IMAGE_HOSTS === '1'
        ? [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' },
          ]
        : [
            {
              protocol: 'https',
              hostname: 'res.cloudinary.com',
              pathname: '/**',
            },
          ],

    /**
     * Prefer AVIF then WebP for optimal delivery.
     * next/image will negotiate based on Accept header.
     */
    formats: ['image/avif', 'image/webp'],

    /**
     * Device breakpoints for srcset generation.
     * Aligned with vehicle media use cases (hero, gallery, card).
     */
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384, 480, 600],
  },
};

export default nextConfig;
