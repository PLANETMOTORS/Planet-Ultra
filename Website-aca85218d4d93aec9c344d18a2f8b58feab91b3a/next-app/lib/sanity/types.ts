// ============================================================
// Planet Motors — Sanity Content TypeScript Types
// ============================================================

export interface SanityImage {
  asset: { url: string };
  alt?: string;
}

export interface SanitySlug {
  current: string;
}

// ── Site Settings ────────────────────────────────────────────
export interface SiteSettings {
  dealerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
  omvicNumber: string;
  hours: { day: string; hours: string }[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  googleMapsEmbedUrl?: string;
  announcementBar?: {
    enabled: boolean;
    message: string;
    link?: string;
  };
}

// ── Homepage ─────────────────────────────────────────────────
export interface HomepageData {
  hero: {
    headline: string;
    subheadline?: string;
    ctaPrimary?: { label: string; url: string };
    ctaSecondary?: { label: string; url: string };
    backgroundImage?: SanityImage;
  };
  trustBadges?: { icon: string; label: string; value: string }[];
  featuredVehicleStockNumbers?: string[];
  promoBanner?: {
    enabled: boolean;
    headline: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    bgColor?: string;
  };
  testimonials?: {
    name: string;
    rating: number;
    body: string;
    date?: string;
  }[];
  faqHighlights?: FaqItem[];
}

// ── Blog ─────────────────────────────────────────────────────
export interface BlogAuthor {
  name: string;
  bio?: string;
  avatar?: SanityImage;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: SanitySlug;
  publishedAt: string;
  excerpt?: string;
  category?: string;
  coverImage?: SanityImage;
  author?: BlogAuthor;
  body?: unknown; // Portable Text — render with @portabletext/react
}

// ── FAQ ──────────────────────────────────────────────────────
export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

// ── Promotion ────────────────────────────────────────────────
export interface Promotion {
  _id: string;
  title: string;
  headline: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  image?: SanityImage;
  pages?: string[];
  order?: number;
}

// ── Static Page ──────────────────────────────────────────────
export interface StaticPageSection {
  _type: string;
  _key: string;
  headline?: string;
  body?: string;
  image?: SanityImage;
  items?: { label: string; value?: string; icon?: string }[];
}

export interface StaticPage {
  _id: string;
  title: string;
  slug: SanitySlug;
  seoTitle?: string;
  seoDescription?: string;
  body?: unknown; // Portable Text
  sections?: StaticPageSection[];
}
