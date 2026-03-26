# SEO Architecture

## Route-by-Route Canonical Policy

| Route | Canonical? | Indexed? | Notes |
|-------|-----------|---------|-------|
| `/` | yes | yes | Homepage — static, AutoDealer JSON-LD |
| `/inventory` | yes | yes | Listing page — ISR 5m revalidate |
| `/inventory/used/[make]/[model]/[slug]` | **yes — only canonical VDP** | yes | schema.org/Car + BreadcrumbList JSON-LD |
| `/inventory/[slug]` | no — helper/redirect only | **no** | `robots: noindex/nofollow`, 308 redirect to canonical |
| `/sell-or-trade` | yes | yes | Static (not yet implemented) |
| `/finance` | yes | yes | Static (not yet implemented) |
| `/api/*` | no | no | Disallowed in robots.txt |

## Metadata Implementation

### `metadataBase`
Set in `app/layout.tsx` from `NEXT_PUBLIC_SITE_URL` (default `https://dev.planetmotors.ca`).
All relative `alternates.canonical` and `openGraph.url` values resolve against this base.

### Title template
`app/layout.tsx` sets `title.template: '%s | Planet Motors'`.
Each page sets `title: 'Page Name'`; the template appends the brand.

### VDP metadata
`lib/seo/buildVehicleMetadata(vehicle)` returns full Metadata including:
- Canonical URL using `buildCanonicalVdpUrl()` — always `/inventory/used/[make]/[model]/[slug]`
- Open Graph `type: 'website'` with hero image dimensions
- Twitter `summary_large_image` card

### Helper route metadata
`app/inventory/[slug]/page.tsx` exports `metadata.robots = { index: false, follow: false }`.
It never calls `buildVehicleMetadata`.

## Structured Data

| Page | Schema type(s) |
|------|---------------|
| `/` | `AutoDealer` |
| `/inventory/used/[make]/[model]/[slug]` | `Car` + `BreadcrumbList` |

Builders:
- `lib/seo/buildVehicleJsonLd.ts` — schema.org/Car with Offer, availability, vehicle attributes
- `lib/seo/buildBreadcrumbJsonLd.ts` — BreadcrumbList for canonical VDP
- `components/JsonLd.tsx` — injects `<script type="application/ld+json">` into the page

## URL helpers

`lib/seo/urlUtils.ts`:
- `toUrlSegment(value)` — lowercases and hyphens a raw string for URL path use
- `buildCanonicalVdpPath(make, model, slug)` — root-relative canonical VDP path
- `buildCanonicalVdpUrl(siteUrl, make, model, slug)` — full canonical VDP URL

All metadata and JSON-LD builders import from `urlUtils`. This is the single source of truth for URL construction.

## Detected Risks (A4 Baseline)

1. **Wrong canonical in `buildVehicleMetadata`** — was using `/inventory/[slug]` (helper route). Fixed to `/inventory/used/[make]/[model]/[slug]`.
2. **No `metadataBase`** — relative canonical/OG URLs would be unresolvable. Fixed.
3. **No title template** — pages had no brand suffix. Fixed.
4. **No structured data** — no JSON-LD anywhere in the Next app. Fixed for homepage and VDP.
5. **Helper route was not noindexed** — could compete with canonical VDP in search. Fixed.
6. **Sitemap included helper route** — sitemap did not include VDPs at all, but the stub pattern could have been wrong. Fixed with async canonical-only VDP function.
7. **robots.txt too permissive** — allowed all paths including `/api/` and `/_next/`. Fixed.
8. **Wildcard `remotePatterns`** — allowed any origin; should be Cloudinary-only. Fixed with env override for dev.
9. **`cacheComponents: true` conflicted with `revalidate`** — caused build failure. Removed.
