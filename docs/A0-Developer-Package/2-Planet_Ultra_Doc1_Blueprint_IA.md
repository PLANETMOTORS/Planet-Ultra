# 2 — Planet Ultra Doc1 Blueprint IA

## Objective
Define the production information architecture for `dev.planetmotors.ca` so product, engineering, SEO, and CRM flows share one source of truth.

## Visual Sitemap (L1)
- `/` Home
- `/inventory`
- `/inventory/used/[make]/[model]/[slug]`
- `/finance`
- `/purchase`
- `/protection`
- `/sign-in`
- `/sign-up`
- `/account` (protected)
- `/saved` (protected)
- `/profile` (protected)
- `/robots.txt`
- `/sitemap.xml`

## User Flows (Core)
1. Discover to conversion:
`Home -> Inventory -> VDP -> Finance or Purchase -> Sign-in -> Submit`
2. Saved vehicle loop:
`Inventory/VDP -> Save -> Sign-in -> /saved -> Return to VDP`
3. Protected route guard:
`Unauthenticated /account|/saved|/profile -> 307 to /sign-in?redirect_url=...`
4. Lead routing:
`Finance/Purchase submit -> API validation -> CRM adapter/webhook -> status feedback`

## IA Rules (Non-Negotiable)
- Canonical VDP route only: `/inventory/used/[make]/[model]/[slug]`.
- No dead-end CTA links.
- Protected routes must never render raw 500 page to user.
- All conversion pages expose clear return path and support path.

## Wireframe Scope (Required)
- Home: hero, trust strip, featured inventory, primary CTAs.
- Inventory: faceted filters, sorting, card grid, pagination.
- VDP: media gallery, specs, trust artifacts, pricing, finance CTA, save CTA.
- Finance: multi-step form with strict validation states.
- Purchase: deposit state machine UI (start, success, cancel, retry).
- Account/Saved/Profile: authenticated shell + empty/loading/error states.

## Acceptance
- Every route above is mapped in design + implementation issue tracker.
- Every CTA has an explicit route target and owner.
- All protected routes are validated in live environment.
