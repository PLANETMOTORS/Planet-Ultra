import type { NextConfig } from 'next';
import { CLOUDINARY_ALLOWED_HOSTS } from './lib/media/cloudinary';

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: CLOUDINARY_ALLOWED_HOSTS.map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },
};

export default nextConfig;
