import type { Metadata } from 'next';
import { BASE_URL, DEALER } from '@/lib/types';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  'Planet Motors | Buy Used EVs & Teslas Online | Richmond Hill, ON | OMVIC Registered Dealer',
    template: '%s | Planet Motors',
  },
  description: 'Buy certified used EVs and Teslas online at Planet Motors. 10-day money-back guarantee, $250 refundable deposit, nationwide delivery. OMVIC Registered Dealer. Richmond Hill, ON.',
  keywords:    ['used EVs', 'used Tesla', 'used cars Richmond Hill', 'electric vehicles Ontario', 'used car dealer Richmond Hill'],
  authors:     [{ name: 'Planet Motors' }],
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type:      'website',
    locale:    'en_CA',
    url:       BASE_URL,
    siteName:  'Planet Motors',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card:    'summary_large_image',
    site:    '@planetmotorsca',
    images:  [`${BASE_URL}/og-image.jpg`],
  },
  other: {
    'geo.region':    'CA-ON',
    'geo.placename': `${DEALER.city}, Ontario, Canada`,
    'geo.position':  `${DEALER.lat};${DEALER.lng}`,
    'ICBM':          `${DEALER.lat}, ${DEALER.lng}`,
  },
};

// Global AutoDealer + WebSite JSON-LD (present on every page)
const globalJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type':       'AutoDealer',
      '@id':         `${BASE_URL}/#dealer`,
      name:          DEALER.name,
      url:           BASE_URL,
      telephone:     DEALER.phone,
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
        '@type':       'AggregateRating',
        ratingValue:   '4.9',
        reviewCount:   '274',
        bestRating:    '5',
        worstRating:   '1',
      },
      sameAs: [
        'https://www.facebook.com/planetmotors',
        'https://www.instagram.com/planetmotorsca',
        'https://x.com/planetmotorsca',
      ],
    },
    {
      '@type':  'WebSite',
      '@id':    `${BASE_URL}/#website`,
      name:     'Planet Motors',
      url:      BASE_URL,
      potentialAction: {
        '@type':       'SearchAction',
        target: {
          '@type':       'EntryPoint',
          urlTemplate:   `${BASE_URL}/inventory/used/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
