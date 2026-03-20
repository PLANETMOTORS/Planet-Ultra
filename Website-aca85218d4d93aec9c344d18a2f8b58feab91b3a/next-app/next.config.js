/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SSR for all pages
  reactStrictMode: true,

  // Image domains allowed for next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.homenetiol.com',
      },
      {
        protocol: 'https',
        hostname: '*.homenetiol.com',
      },
      {
        protocol: 'https',
        hostname: 'images.driveai.com',
      },
      {
        protocol: 'https',
        hostname: '*.driveai.com',
      },
      {
        protocol: 'https',
        hostname: 'images.carpages.ca',
      },
      // Sanity CDN — project cgb59sfd
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [400, 800, 1200, 1600],
    imageSizes: [400, 800],
  },

  // Trailing slash for canonical URLs
  trailingSlash: true,

  // Headers for security
  // Note: robots indexing is controlled per-page via Next.js metadata — do NOT set X-Robots-Tag
  // globally here as it would override per-page noindex directives on filtered SRP pages.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },

  // 301 redirects for legacy URL patterns
  async redirects() {
    return [
      { source: '/inventory', destination: '/inventory/used/', permanent: true },
      { source: '/vehicles/:path*', destination: '/inventory/used/', permanent: true },
      { source: '/used-cars/:path*', destination: '/inventory/used/', permanent: true },
      { source: '/cars/:path*', destination: '/inventory/used/', permanent: true },
      { source: '/sell-my-car', destination: '/sell/', permanent: true },
      { source: '/sell-car', destination: '/sell/', permanent: true },
      { source: '/trade', destination: '/sell/', permanent: true },
      { source: '/trade-in', destination: '/sell/', permanent: true },
      { source: '/financing', destination: '/finance/', permanent: true },
      { source: '/apply', destination: '/finance/', permanent: true },
      { source: '/about-us', destination: '/about/', permanent: true },
      { source: '/contact-us', destination: '/contact/', permanent: true },
      { source: '/warranty', destination: '/protection/', permanent: true },
      { source: '/extended-warranty', destination: '/protection/', permanent: true },
      { source: '/frequently-asked-questions', destination: '/faq/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
