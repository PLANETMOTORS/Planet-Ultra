# A4 Hardening Plan (SEO / Media / Runtime)

## 1) Current risks detected

1. Canonical VDP metadata had been generated from short route patterns, risking duplicate-index signals.
2. Route-level metadata and JSON-LD were missing on inventory and canonical VDP surfaces.
3. Sitemap entries could diverge from canonical VDP policy when generated from non-canonical URLs.
4. `robots` policy did not explicitly protect non-public/helper/internal surfaces.
5. Image runtime allowed all remote hosts, violating Cloudinary-only media truth and increasing risk.
6. 360 behavior was not explicitly isolated from LCP-critical rendering in VDP runtime.
7. Revalidation cadence and route cache intent were not aligned/documented per homepage/inventory/VDP/sitemap.

## 2) Route-by-route SEO plan

### `/` (homepage)
- Add explicit page metadata with canonical URL.
- Add route-specific JSON-LD (`AutoDealer`, `WebSite`).
- Keep UI layout unchanged; only head/runtime hardening.

### `/inventory`
- Add explicit page metadata and canonical URL.
- Add route-specific JSON-LD (`CollectionPage` + `ItemList` of canonical VDP URLs).
- Ensure inventory cards link only to canonical nested VDP URLs.

### `/inventory/used/[make]/[model]/[slug]` (canonical VDP)
- Generate metadata from vehicle facts with canonical URL on nested route only.
- Add VDP JSON-LD (`Vehicle` + `Offer` + organization context).
- Keep route server-rendered with bounded revalidation.

### `/inventory/[slug]` (helper)
- Keep as redirect/helper only.
- Do not emit canonical metadata; never treated as canonical output.
- Permanently redirect to nested canonical route when vehicle exists; fallback to `/inventory`.

## 3) Route-by-route media/performance plan

### Homepage
- Preserve existing shell, avoid UI redesign.
- Keep media placeholders non-blocking.
- Ensure metadata/JSON-LD and static render are cache-friendly.

### Inventory
- Keep card shell and link structure.
- Use canonical route links to avoid duplicate crawl paths.
- Avoid introducing heavy client runtime.

### Canonical VDP
- Use fixed image dimensions and responsive `sizes` for CLS/LCP protection.
- Restrict image hosts to Cloudinary runtime policy.
- Keep hero media in critical path; defer non-critical media.

## 4) 360 runtime plan

- Maintain poster-first behavior using a standard image.
- Keep 360 viewer behind explicit user interaction (click-to-hydrate).
- Do not preload 360 runtime.
- Render 360 outside the critical hero render path.

## 5) Cache/revalidation plan

- Homepage revalidate: 300s
- Inventory revalidate: 120s
- Canonical VDP revalidate: 120s
- Sitemap revalidate: 1800s
- Apply route-level revalidate exports and static intent where safe.
- Keep canonical generation deterministic from route helpers and vehicle facts.

## 6) Verification checklist

- [x] Homepage metadata implemented and safe.
- [x] Inventory metadata implemented and safe.
- [x] Canonical VDP metadata aligned to nested canonical route only.
- [x] Helper short VDP route excluded from canonical output.
- [x] Structured data route-specific and correct by surface.
- [x] Sitemap emits canonical nested VDP URLs only.
- [x] Robots guidance aligned to public vs non-public/helper surfaces.
- [x] Image/runtime rules defined and safely applied (Cloudinary-only host policy).
- [x] 360 isolated from critical render path, poster-first click-to-hydrate.
- [x] Homepage/inventory/VDP include LCP/CLS-focused runtime hardening.
- [ ] Lint/typecheck/build pass (validated in verification run).

## 7) Merge/integration notes

- Hardening keeps route policy intact: nested VDP canonical, short VDP helper only.
- DTO ownership unchanged: `Vehicle` contract remains in `types/vehicle.ts`.
- No finance/lender/business logic introduced.
- UI shell and route structure preserved; changes are metadata/runtime-only.
- Inventory/VDP data access remains server-side and bounded for cache/revalidation hardening.
