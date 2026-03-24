export const siteSettings = {
  name: 'Planet Motors',
  description:
    'Browse used EVs, Teslas, SUVs, and premium vehicles from Planet Motors in Richmond Hill, Ontario.',
  htmlLang: 'en-CA',
  ogLocale: 'en_CA',
  socialHandle: '@planetmotorsca',
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
