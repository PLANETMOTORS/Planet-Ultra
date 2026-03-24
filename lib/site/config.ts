const DEFAULT_SITE_URL = 'https://www.planetmotors.app';
const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_630/sample.jpg';

function normalizeSiteUrl(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const siteConfig = {
  name: 'Planet Motors',
  description:
    'Browse used EVs, Teslas, SUVs, and premium vehicles from Planet Motors in Richmond Hill, Ontario.',
  htmlLang: 'en-CA',
  ogLocale: 'en_CA',
  socialHandle: '@planetmotorsca',
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL),
  defaultOpenGraphImage: DEFAULT_OG_IMAGE,
  dealer: {
    phone: '+18667973332',
    displayPhone: '1-866-797-3332',
    address: {
      streetAddress: '30 Major Mackenzie Dr E',
      addressLocality: 'Richmond Hill',
      addressRegion: 'ON',
      postalCode: 'L4C 1G7',
      addressCountry: 'CA',
    },
    geo: {
      latitude: 43.8758,
      longitude: -79.4378,
    },
    openingHours: ['Mo-Fr 09:00-19:00', 'Sa 09:00-18:00'],
    sameAs: [
      'https://www.facebook.com/planetmotors',
      'https://www.instagram.com/planetmotorsca',
      'https://x.com/planetmotorsca',
    ],
  },
} as const;

export function getSiteUrl(): string {
  return siteConfig.siteUrl;
}

export function buildAbsoluteUrl(path: string): string {
  return path.startsWith('http')
    ? path
    : `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
