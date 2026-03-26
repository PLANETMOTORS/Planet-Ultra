# SEO Architecture — PLANETMOTORS/Planet-Ultra

## Core principle
Server-rendered metadata on every route. No client-side meta tag injection.

## Required on every route segment

```ts
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '...',
    description: '...',
    openGraph: { ... },
    alternates: { canonical: '...' },
  }
}
```

## Route-specific rules

### Homepage (`app/page.tsx`)
- Title: brand name + primary value proposition
- OG image: hero brand image

### VDP (`app/inventory/[slug]/page.tsx`)
- Title pattern: `{year} {make} {model} {trim} | Planet Motors`
- Description: `{mileageKm} km · {priceCad} · Available in [city]`
- Canonical: `/inventory/{slug}`
- Structured data: `Vehicle` schema (JSON-LD) via `<script type="application/ld+json">`

### Inventory listing
- Title: `Used Cars for Sale | Planet Motors`
- Canonical: `/inventory`
- Pagination: `rel="next"` / `rel="prev"` link tags

## `app/sitemap.ts`
- Must include homepage, inventory listing, and all active VDP slugs
- VDP entries must use `lastModified: vehicle.updatedAt`
- Crawl priority: homepage 1.0, inventory 0.9, VDP 0.8

## `app/robots.ts`
- Allow all crawlers on all routes
- Point `sitemap` to the correct production domain

## What not to do
- Do not use `next/head` — App Router uses `generateMetadata` only
- Do not set meta tags from Client Components
- Do not block Googlebot in `robots.ts`
