# Architecture Rules

## Route Policy (A1 — preserved)

- `/` — homepage, static, `AutoDealer` JSON-LD
- `/inventory` — listing page, ISR 5m
- `/inventory/used/[make]/[model]/[slug]` — canonical VDP only
- `/inventory/[slug]` — redirect helper, noindex, never canonical
- `/sell-or-trade`, `/finance` — static public pages

## Data Boundaries (A2 — preserved)

- Postgres is the rendering truth for all vehicle facts
- Cloudinary is the frontend media truth for all vehicle images
- No finance/lender/business logic on VDP or inventory pages
- The `Vehicle` type in `types/vehicle.ts` is the contract boundary

## UI Structure (A3 — preserved)

- No UI redesign in A4
- `app/page.tsx` preserves the original homepage shell structure
- New route pages (`/inventory`, `/inventory/used/...`) use the same CSS class patterns
- No Tailwind utilities added; CSS is in `app/globals.css`

## SEO Rules (A4 — hardening)

1. `metadataBase` must be set in root layout from `NEXT_PUBLIC_SITE_URL`
2. `buildVehicleMetadata()` must only be called from the canonical VDP page
3. `buildCanonicalVdpUrl()` is the single source of truth for VDP URL construction
4. Helper route `/inventory/[slug]` must always carry `robots: noindex/nofollow`
5. Sitemap must include canonical VDP URLs only (never helper route)
6. `robots.ts` must disallow `/api/`, `/admin/`, `/_next/`

## Media Rules (A4 — hardening)

1. `next.config.ts` `remotePatterns` restricts to `res.cloudinary.com` in production
2. Set `NEXT_PUBLIC_ALLOW_ALL_IMAGE_HOSTS=1` to bypass in development/staging
3. `formats: ['image/avif', 'image/webp']` enables optimal delivery via next/image
4. Hero image must have explicit `width`/`height` to prevent CLS
5. 360 assets must never load on page render — click-to-hydrate only

## Cache Rules (A4 — hardening)

1. `cacheComponents: true` is incompatible with per-route `revalidate` — must not be used together
2. `/inventory` uses `revalidate = 300` (5m ISR)
3. Canonical VDP uses `revalidate = 300` (5m ISR) once Postgres is wired
4. Helper redirect uses `dynamic = 'force-dynamic'`
5. Sitemap and robots are static; rebuild on deploy
