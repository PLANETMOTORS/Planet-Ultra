# VDP Lock Spec — PLANETMOTORS/Planet-Ultra

## What is the "locked VDP"
The Vehicle Detail Page (VDP) UX is locked to the reference design in `reference/locked-ux/`. No layout or interaction changes are permitted without explicit approval from Toni (project owner).

## Reference
See `reference/locked-ux/` for the approved design files.

## Required sections (in order)
1. **Hero image** — full-width, above the fold, loaded eagerly (`priority` on `<Image>`)
2. **Vehicle title** — year, make, model, trim
3. **Price block** — `priceCad`, `salePriceCad` (if present), finance CTA
4. **Key specs** — mileage, body style, drivetrain, fuel type, transmission
5. **Gallery** — `galleryImages` lazy-loaded below hero
6. **Finance calculator** — uses `lib/finance/` engine, rendered client-side
7. **360 viewer** — `hero360Asset` lazy-loaded after all above; must not block any above section

## Vehicle data requirements
All fields rendered on VDP must be present in `types/vehicle.ts` and `docs/vehicle-contract.md`.

## SEO requirements
- `generateMetadata` with title, description, OG image, and canonical
- JSON-LD Vehicle schema in `<script type="application/ld+json">`

## Status handling
| Status | VDP behaviour |
|---|---|
| `available` | Full VDP, all CTAs active |
| `pending` | VDP visible, show "Sale Pending" badge |
| `reserved` | VDP visible, show "Reserved" badge, disable finance CTA |
| `sold` | Redirect to inventory listing or show sold overlay |

## What must not change without approval
- Section order
- Hero image size and placement
- Price block layout
- Finance CTA button text and position
