import type { Metadata } from 'next';
import { STATIC_META } from '@/lib/seo';
import { BASE_URL, DEALER } from '@/lib/types';

export const metadata: Metadata = STATIC_META.home;

const dealerJsonLd = {
  '@context': 'https://schema.org',
  '@type':    'AutoDealer',
  name:       DEALER.name,
  url:        BASE_URL,
  telephone:  DEALER.phone,
  address: {
    '@type':         'PostalAddress',
    streetAddress:   DEALER.address,
    addressLocality: DEALER.city,
    addressRegion:   DEALER.province,
    postalCode:      DEALER.postalCode,
    addressCountry:  'CA',
  },
  openingHours: ['Mo-Fr 10:00-18:00', 'Sa 10:00-17:00'],
  priceRange:   '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '274',
    bestRating:  '5',
    worstRating: '1',
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
      />
      {/*
        The homepage UI is rendered by the existing SPA (index.html).
        Next.js handles metadata, JSON-LD, and routing.
        When the full React UI migration is complete, replace this
        with full React components matching the existing design.
      */}
      <div id="planet-motors-app" />
    </>
  );
}
