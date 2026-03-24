# SEO Architecture — Planet Motors / Planet Ultra

**Phase:** A4 — Performance, SEO, and Media Runtime  
**Status:** Active  
**Owner:** A4 agent (Cursor)  
**Last updated:** March 2026

---

## Canonical Route Policy

The canonical VDP URL structure is locked at the A1 level and must never change:

```
/inventory/used/[make]/[model]/[slug]
```

- `/inventory/[slug]` is a redirect/helper route only — never canonical
- All `<link rel="canonical">` tags, sitemap entries, and `generateMetadata` output must
  reference the full nested path
- No agent may introduce a new canonical route pattern without explicit owner approval

---

## Route-by-Route Metadata Strategy

### Homepage `/`

**Purpose:** Brand entry point and local SEO anchor  
**Title format:** `Planet Motors — Used Cars in Richmond Hill, ON`  
**Description approach:** One sentence about what Planet Motors is, one about what makes
it worth visiting (honest, specific, local). Not generic dealership boilerplate.  
**OG image:** Hero image of the lot or a featured vehicle — never a logo on white  
**Canonical:** `https://planetmotors.ca/`

### Inventory `/inventory`

**Purpose:** Browse/search landing page  
**Title format:** `Used Cars for Sale in Richmond Hill — Planet Motors`  
**Description approach:** Mention the breadth of inventory honestly. If a filter is active
(make, body style), the title and description must reflect that filter.  
**OG image:** A representative inventory card image or a lot photo  
**Canonical:** `https://planetmotors.ca/inventory` (or filtered variant)

### Canonical VDP `/inventory/used/[make]/[model]/[slug]`

**Purpose:** Individual vehicle detail page — primary SEO surface  
**Title format:** `[Year] [Make] [Model] [Trim] — Planet Motors Richmond Hill`  
  Example: `2021 Honda Civic LX Sedan — Planet Motors Richmond Hill`  
**Description approach:** Mention one specific, verifiable detail about the vehicle (mileage,
owner history, condition signal) and a soft CTA. Never generic.  
  Example: `One-owner 2021 Civic with 42,000 km and a clean Carfax. Book a test drive today.`  
**OG image:** Primary vehicle image from Cloudinary — sized correctly for social sharing  
**Canonical:** Full nested path — must match the slug exactly

### Fallback Behavior

When CMS content or vehicle data is partially missing:

- If `trim` is missing from VDP title: omit trim, do not substitute "N/A" or a keyword
- If mileage is unknown: use a condition signal if available, otherwise write a generic but
  honest description — never invent a mileage figure
- If OG image is unavailable: fall back to a branded lot/hero image — never a broken image or
  logo-on-white

---

## Structured Data Plan

### Organization Schema — Homepage

```json
{
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "Planet Motors",
  "url": "https://planetmotors.ca",
  "telephone": "+14169852277",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "30 Major Mackenzie Dr E",
    "addressLocality": "Richmond Hill",
    "addressRegion": "ON",
    "postalCode": "L4C 1G4",
    "addressCountry": "CA"
  }
}
```

### WebSite Schema — Homepage

Include `SearchAction` only if site search is functional and indexed:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Planet Motors",
  "url": "https://planetmotors.ca"
}
```

### Vehicle Schema — Canonical VDP

Use `Car` type under `Product` where appropriate. Key fields:

- `name`: `[Year] [Make] [Model] [Trim]` — real values only
- `description`: A full readable sentence — not a keyword string
- `vehicleIdentificationNumber`: VIN if available
- `mileageFromOdometer`: actual km reading
- `offers.price`: listed price
- `offers.priceCurrency`: `CAD`
- `image`: Cloudinary URL of primary image

Never fabricate values. Omit fields with unknown values rather than using placeholders.

### BreadcrumbList Schema — VDP

```
Home > Inventory > Used [Make] > [Year] [Make] [Model]
```

Each breadcrumb item must have a real, resolvable URL.

---

## Sitemap Rules

- Emit canonical nested VDP URLs only: `/inventory/used/[make]/[model]/[slug]`
- Never emit `/inventory/[slug]` in the sitemap
- Homepage, `/inventory`, and filtered inventory pages: include with `changefreq: daily`
- VDP pages: `changefreq: weekly`, `priority: 0.8`
- Exclude: admin routes, API routes, auth routes, draft/preview routes
- Revalidate sitemap on inventory change events via Upstash Redis signal

---

## Robots.txt Rules

```
User-agent: *
Allow: /
Allow: /inventory/
Allow: /inventory/used/

Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /studio/
```

- Do not disallow `/inventory/[slug]` — those redirects should be crawlable
- Do not block Googlebot from any public vehicle or inventory page

---

## Copy Writing Standards

All SEO copy — titles, descriptions, alt text, schema text — must follow these rules.

### Voice

Write as a knowledgeable local expert. Confident, direct, honest. Not corporate, not AI.

### What Good Looks Like

| Element | Good | Bad |
|---|---|---|
| VDP title | `2021 Honda Civic LX Sedan — Planet Motors Richmond Hill` | `Best Used Honda Civic Deals Ontario Dealership 2021` |
| Meta description | `One-owner 2021 Civic with 42,000 km and a clean Carfax. Book a test drive today.` | `Find great deals on used Honda Civic at Planet Motors. Browse inventory and contact us.` |
| Alt text | `Front three-quarter view of a 2021 white Honda Civic LX at Planet Motors` | `Used car for sale` |
| Schema description | `A well-maintained 2021 Honda Civic LX with 42,000 km, clean Carfax, and original floor mats.` | `Honda Civic LX used car Richmond Hill Ontario dealership` |

### Banned Phrases

Never appear in any output from any agent:

```
dive into · delve into · let's explore · it's worth noting · needless to say
seamless · robust · cutting-edge · game-changer · revolutionize · leverage (verb)
in today's world · in today's digital age · in the ever-evolving landscape
a testament to · look no further · your one-stop shop · we pride ourselves
Welcome to Planet Motors · Don't hesitate to contact us
```

---

## Performance Notes (A4 Scope)

- All metadata generation happens server-side via `generateMetadata` — never client-side
- OG images must be pre-generated or served from Cloudinary with correct dimensions (1200×630)
- Canonical tags must be rendered in `<head>` on first server response — not injected by JS
- Structured data JSON-LD must be inlined in `<script type="application/ld+json">` on the
  server render — not lazy-loaded
