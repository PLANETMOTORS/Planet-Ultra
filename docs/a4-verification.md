# A4 verification

This document records the A4 hardening verification package inside the repository so it can be reviewed without relying on external artifact paths.

## Current file map in this branch

- `app/page.tsx`
- `app/inventory/page.tsx`
- `app/inventory/[slug]/page.tsx`
- `app/inventory/used/[make]/[model]/[slug]/page.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `lib/seo/metadata.ts`
- `lib/seo/schema.ts`
- `lib/seo/buildVehicleMetadata.ts`
- `components/media/Vehicle360Video.tsx`
- `components/media/Vehicle360Viewer.tsx`
- `components/seo/StructuredData.tsx`
- `lib/site/settings.ts`
- `lib/site/config.ts`
- `next.config.ts`

## Canonical host baseline

The shared baseline is:

- `https://www.planetmotors.app`

Source:

- `lib/site/config.ts`

## Site-settings source of truth

Dealer identity and site identity values are centralized in:

- `lib/site/settings.ts`

`lib/site/config.ts` composes runtime URL values around those settings and is consumed by metadata, robots, sitemap, structured data, and media helpers.

## Command verification

### `npm run lint`

Result: pass, no warnings.

Output:

```text
> planet-ultra@0.1.0 lint
> eslint .
```

### `npm run typecheck`

Result: pass.

Output:

```text
> planet-ultra@0.1.0 typecheck
> tsc --noEmit
```

### `npm run build`

Result: pass.

Output excerpt:

```text
> planet-ultra@0.1.0 build
> next build

▲ Next.js 16.2.1 (Turbopack)
- Cache Components enabled

Creating an optimized production build ...
✓ Compiled successfully
Finished TypeScript
✓ Generating static pages
```

## Route output verification

These checks were run against a fresh production server started from this branch.

### Homepage `/`

- Title: `Planet Motors | Used EVs, Teslas, and Premium Vehicles in Richmond Hill`
- Canonical: `https://www.planetmotors.app`
- Robots: `index, follow`
- `og:url`: `https://www.planetmotors.app`
- JSON-LD present: yes

### Inventory `/inventory`

- Title: `Used Inventory | Planet Motors`
- Canonical: `https://www.planetmotors.app/inventory`
- Robots: `index, follow`
- `og:url`: `https://www.planetmotors.app/inventory`
- JSON-LD present: yes

### Filtered inventory `/inventory?make=BMW`

- Canonical: none
- Robots: `noindex, follow`
- `og:url`: `https://www.planetmotors.app/inventory`
- JSON-LD present: yes

### Canonical Tesla VDP `/inventory/used/tesla/model-3/2022-tesla-model-3-rwd-pm1003`

- Title: `2022 Tesla Model 3 RWD for Sale in Richmond Hill | Planet Motors`
- Canonical: `https://www.planetmotors.app/inventory/used/tesla/model-3/2022-tesla-model-3-rwd-pm1003`
- Robots: `index, follow`
- `og:url`: `https://www.planetmotors.app/inventory/used/tesla/model-3/2022-tesla-model-3-rwd-pm1003`
- `og:image`: `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1600/docs/models.jpg`
- JSON-LD present: yes

## Structured-data validation

Validated JSON-LD types by route:

- `/` -> `AutoDealer`, `WebSite`
- `/inventory` -> `BreadcrumbList`, `ItemList`
- `/inventory/used/tesla/model-3/2022-tesla-model-3-rwd-pm1003` -> `Vehicle`, `ImageObject`, `BreadcrumbList`

## Helper redirect verification

Request:

- `HEAD /inventory/2022-tesla-model-3-rwd-pm1003`

Result:

- `308 Permanent Redirect`
- `Location: /inventory/used/tesla/model-3/2022-tesla-model-3-rwd-pm1003`

## Sitemap verification

Verified entries include only:

- `https://www.planetmotors.app/`
- `https://www.planetmotors.app/inventory`
- canonical nested VDP URLs under `/inventory/used/...`

Verified entries do not include:

- helper `/inventory/[slug]` URLs

## Robots verification

Verified output:

```text
User-Agent: *
Allow: /
Allow: /inventory
Allow: /inventory/used/
Disallow: /inventory/*?*
Disallow: /api/
Disallow: /_next/

Host: https://www.planetmotors.app
Sitemap: https://www.planetmotors.app/sitemap.xml
```

## 360 verification

### Pre-click proof

For Tesla canonical VDP server HTML:

- `Load 360 view` text is present
- `<video>` tag is not present before interaction

This confirms the 360 viewer is poster-first and does not render the active video player into initial HTML.

### Manual browser proof

The browser walkthrough confirmed:

1. Tesla canonical VDP loads.
2. Poster-first 360 surface is visible before click.
3. Clicking the poster hydrates the viewer and loads the video player.
4. Navigating to the helper flat Tesla URL redirects to the nested canonical route.

## Note on earlier reviewer mismatch

An earlier summary referenced some files by old conceptual names. The active branch file names are the ones listed in `Current file map in this branch`, and that is the authoritative mapping for this repository state.
