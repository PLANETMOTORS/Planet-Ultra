import { siteSettings } from '@/lib/site/settings';

const DEFAULT_SITE_URL = 'https://www.planetmotors.app';
const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_630/sample.jpg';

function normalizeSiteUrl(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const siteConfig = {
  ...siteSettings,
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL),
  defaultOpenGraphImage: DEFAULT_OG_IMAGE,
} as const;

export function getSiteUrl(): string {
  return siteConfig.siteUrl;
}

export function buildAbsoluteUrl(path: string): string {
  return path.startsWith('http')
    ? path
    : `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
