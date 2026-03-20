// ============================================================
// Planet Motors — SEO Metadata Generator
// ============================================================
// Generates Next.js Metadata objects for every page type.
// All templates follow the SEO engineer's addendum exactly.
// ============================================================

import type { Metadata } from 'next';
import type { Vehicle } from './types';
import { BASE_URL, DEALER } from './types';

// ── VDP Metadata ─────────────────────────────────────────────
export function vdpMetadata(v: Vehicle): Metadata {
  const trimPart = v.trim ? ` ${v.trim}` : '';
  const fullName = `${v.year} ${v.make} ${v.model}${trimPart}`;
  const title    = `${fullName} for Sale in ${DEALER.city}, ${DEALER.province} | Planet Motors`;
  const desc     = `Shop this ${fullName} at Planet Motors. View photos, inspection details, ${v.km.toLocaleString('en-CA')} km, $${v.price.toLocaleString('en-CA')} CAD. Financing, delivery, and 10-day money-back return available.`;
  const url      = `${BASE_URL}${v.canonicalPath}`;
  const image    = v.images[0]?.url || `${BASE_URL}/og-image.jpg`;

  return {
    title,
    description: desc,
    alternates:  { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      images: [{ url: image, width: 800, height: 533, alt: v.images[0]?.alt || fullName }],
      type:   'website',
      locale: 'en_CA',
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description: desc,
      images:      [image],
      site:        '@planetmotorsca',
    },
  };
}

// ── SRP Metadata ─────────────────────────────────────────────
export function srpMetadata(opts?: {
  make?: string;
  model?: string;
  fuel?: string;
  body?: string;
  city?: string;
}): Metadata {
  const { make, model, fuel, body, city = DEALER.city } = opts || {};

  let title: string;
  let desc: string;
  let path = '/inventory/used/';

  if (make && model) {
    title = `Used ${make} ${model} for Sale in ${city}, ON | Planet Motors`;
    desc  = `Shop used ${make} ${model} inventory at Planet Motors. Certified, transparent pricing, 10-day return, Ontario delivery.`;
    path  = `/inventory/used/${make.toLowerCase()}/${model.toLowerCase()}/`;
  } else if (make) {
    title = `Used ${make} for Sale in ${city}, ON | Planet Motors`;
    desc  = `Browse used ${make} vehicles at Planet Motors in Richmond Hill. All models, transparent pricing, 10-day return guarantee.`;
    path  = `/inventory/used/${make.toLowerCase()}/`;
  } else if (fuel === 'electric') {
    title = `Used Electric Vehicles for Sale in ${city}, ON | Planet Motors`;
    desc  = `Shop used EVs and Teslas at Planet Motors Richmond Hill. Transparent pricing, 10-day money-back guarantee, nationwide delivery.`;
    path  = `/inventory/used/electric/`;
  } else {
    title = `Used EVs & Cars for Sale in ${city}, ON | Planet Motors`;
    desc  = `Browse Planet Motors' full inventory of used EVs, Teslas, hybrids, and more. Transparent pricing, 10-day returns, Ontario delivery. Richmond Hill, ON.`;
  }

  const url = `${BASE_URL}${path}`;

  return {
    title,
    description: desc,
    alternates:  { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
      type:   'website',
      locale: 'en_CA',
    },
  };
}

// ── VDP JSON-LD Schema ────────────────────────────────────────
export function vdpJsonLd(v: Vehicle): object[] {
  const trimPart = v.trim ? ` ${v.trim}` : '';
  const fullName = `${v.year} ${v.make} ${v.model}${trimPart}`;
  const url      = `${BASE_URL}${v.canonicalPath}`;
  const avail    = v.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut';
  const fuelMap  = { electric: 'Electric', hybrid: 'Hybrid', 'plug-in hybrid': 'Plug-in Hybrid', gasoline: 'Gasoline', diesel: 'Diesel' };

  const vehicleSchema = {
    '@context': 'https://schema.org',
    '@type':    'Vehicle',
    name:       fullName,
    brand:      { '@type': 'Brand', name: v.make },
    model:      v.model,
    vehicleModelDate: String(v.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.km, unitCode: 'KMT' },
    vehicleIdentificationNumber: v.vin,
    color:      v.color,
    bodyType:   v.body,
    fuelType:   fuelMap[v.fuel] || 'Gasoline',
    itemCondition: 'https://schema.org/UsedCondition',
    image:      v.images[0]?.url || '',
    offers: {
      '@type':        'Offer',
      priceCurrency:  'CAD',
      price:          v.price,
      availability:   avail,
      url,
      seller: { '@type': 'AutoDealer', name: 'Planet Motors' },
    },
  };

  const imageSchema = v.images[0] ? {
    '@context':   'https://schema.org',
    '@type':      'ImageObject',
    contentUrl:   v.images[0].url,
    name:         v.images[0].alt,
    description:  v.images[0].alt,
    caption:      `${fullName} — Planet Motors Richmond Hill`,
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Inventory', item: `${BASE_URL}/inventory/used/` },
      { '@type': 'ListItem', position: 3, name: v.make,      item: `${BASE_URL}/inventory/used/${v.make.toLowerCase()}/` },
      { '@type': 'ListItem', position: 4, name: fullName,    item: url },
    ],
  };

  return [vehicleSchema, imageSchema, breadcrumbSchema].filter(Boolean) as object[];
}

// ── Static page metadata ──────────────────────────────────────
export const STATIC_META: Record<string, Metadata> = {
  home: {
    title:       'Planet Motors | Buy Used EVs & Teslas Online | Richmond Hill, ON | OMVIC Registered Dealer',
    description: 'Buy certified used EVs and Teslas online at Planet Motors. 10-day money-back guarantee, $250 refundable deposit, nationwide delivery. OMVIC Registered Dealer. Richmond Hill, ON.',
    alternates:  { canonical: `${BASE_URL}/` },
  },
  finance: {
    title:       'Auto Financing for All Credit Types | Planet Motors Richmond Hill',
    description: 'Get approved for auto financing at Planet Motors. All credit types welcome, new Canadians included. Apply online in minutes. Richmond Hill, ON.',
    alternates:  { canonical: `${BASE_URL}/finance/` },
  },
  sell: {
    title:       'Sell My Car in Richmond Hill | Get a Real Offer in 2 Minutes | Planet Motors',
    description: 'Sell or trade your car to Planet Motors. Get a real offer in 2 minutes. No obligation. We buy all makes and models. Richmond Hill, ON.',
    alternates:  { canonical: `${BASE_URL}/sell/` },
  },
  about: {
    title:       'About Planet Motors | Richmond Hill Used EV Dealer | OMVIC Registered Dealer',
    description: 'Planet Motors is Richmond Hill\'s trusted used EV and Tesla dealer. OMVIC Registered Dealer. Honest, transparent, no-pressure car buying.',
    alternates:  { canonical: `${BASE_URL}/about/` },
  },
  contact: {
    title:       'Contact Planet Motors | Richmond Hill, ON | Used EV Dealership',
    description: 'Contact Planet Motors at 30 Major Mackenzie Dr E, Richmond Hill, ON. Call 1-866-797-3332. Mon–Fri 9AM–7PM, Sat 9AM–6PM.',
    alternates:  { canonical: `${BASE_URL}/contact/` },
  },
  faq: {
    title:       'Frequently Asked Questions | Planet Motors Used EVs Richmond Hill',
    description: 'Answers to common questions about buying a used EV at Planet Motors. 10-day returns, financing, delivery, OMVIC, and more.',
    alternates:  { canonical: `${BASE_URL}/faq/` },
  },
  protection: {
    title:       'Planet Care Protection Plans | Planet Motors Richmond Hill',
    description: 'Planet Motors offers PlanetCare™ extended warranty, GAP coverage, Incident Pro, and Replacement Warranty plans for used cars in Richmond Hill, ON.',
    alternates:  { canonical: `${BASE_URL}/protection/` },
  },
  'protection-incident-pro': {
    title:       'Incident Pro Protection | Planet Motors Richmond Hill',
    description: 'Incident Pro covers dings, windshield chips, ripped upholstery, and lost key fobs, all without affecting your insurance. Planet Motors, Richmond Hill, ON.',
    alternates:  { canonical: `${BASE_URL}/protection/incident-pro/` },
  },
  'protection-replacement-warranty': {
    title:       'Replacement Warranty Plan | Planet Motors Richmond Hill',
    description: 'The Replacement Warranty Plan ensures you receive a like-for-like replacement vehicle after a total loss, not just a depreciated payout. Planet Motors, ON.',
    alternates:  { canonical: `${BASE_URL}/protection/replacement-warranty/` },
  },
  'protection-gap-coverage': {
    title:       'Companion GAP Coverage | Planet Motors Richmond Hill',
    description: "Companion GAP Coverage bridges the gap between your insurance payout and your loan balance after theft or total loss. Planet Motors Richmond Hill, ON.",
    alternates:  { canonical: `${BASE_URL}/protection/gap-coverage/` },
  },
  blog: {
    title:       'EV Tips, News & Buying Guides | Planet Motors Blog',
    description: 'EV buying guides, tips, and Canadian auto market news from the Planet Motors team in Richmond Hill, ON.',
    alternates:  { canonical: `${BASE_URL}/blog/` },
  },
};
