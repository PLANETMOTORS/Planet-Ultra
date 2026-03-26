# VDP Lock Spec

## Canonical Route

```
/inventory/used/[make]/[model]/[slug]
```

This is the only canonical VDP URL. It is the only VDP route that:
- Emits a `<link rel="canonical">` tag
- Appears in the sitemap
- Receives structured data (schema.org/Car + BreadcrumbList)
- Receives `index: true` robots

## Helper Route

```
/inventory/[slug]
```

This route:
- Is a redirect helper only (308 permanent to canonical)
- Is excluded from the sitemap
- Carries `robots: { index: false, follow: false }`
- Never calls `buildVehicleMetadata` or emits structured data

## Data Source

- **Postgres** is the rendering truth for all vehicle facts (year, make, model, mileage, price, status, VIN, etc.)
- **Cloudinary** is the frontend media truth for all vehicle images
- The `Vehicle` TypeScript type in `types/vehicle.ts` defines the full contract

## Media Rules on VDP

1. Hero image (`Vehicle.heroImage`) is the LCP candidate — render immediately as `<img>` or `<Image>` with explicit `width` and `height`.
2. Gallery images render below the fold — no `fetchpriority="high"`.
3. 360 asset is always poster-first, click-to-hydrate. See `lib/media/360.ts`.

## 360 Isolation Contract

See `lib/media/360.ts` for full documentation. Summary:
- Render poster image (`hero360Asset.posterImageUrl`) immediately as a standard `<img>`.
- Load the viewer JS/assets only on user interaction (click/tap) via dynamic import.
- The viewer container must have explicit aspect-ratio or min-height to prevent CLS.
- No `preload`, `prefetch`, or `fetchpriority="high"` on any 360 asset.

## Metadata

`generateMetadata()` in the canonical VDP page calls `buildVehicleMetadata(vehicle)`.
Returns `{ title: 'Vehicle Not Found', robots: { index: false, follow: false } }` if the vehicle is not found.

## Structured Data

Two JSON-LD scripts on every valid VDP:
1. `schema.org/Car` — built by `lib/seo/buildVehicleJsonLd(vehicle)`
2. `schema.org/BreadcrumbList` — Home → Inventory → Vehicle name

## Status-to-Availability Mapping

| Vehicle status | schema.org availability |
|---------------|------------------------|
| `available` | `InStock` |
| `pending` | `LimitedAvailability` |
| `reserved` | `LimitedAvailability` |
| `sold` | `OutOfStock` |
