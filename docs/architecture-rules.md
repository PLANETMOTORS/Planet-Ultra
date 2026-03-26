# Architecture Rules — PLANETMOTORS/Planet-Ultra

## Framework
- Next.js 16, App Router only
- No Pages Router (`pages/` directory must not exist)
- No `getServerSideProps`, `getStaticProps`, or `getInitialProps`

## Rendering
- **Server Components by default** for all route segments and layouts
- Use `"use client"` only when the component requires browser APIs, event handlers, or React hooks
- Prefer streaming with `Suspense` boundaries over full-page loading states

## TypeScript
- Strict mode is enabled — all files must pass `npm run typecheck`
- Shared types live in `types/`
- The vehicle data contract (`types/vehicle.ts`) is the source of truth for all vehicle data shapes

## Styling
- Tailwind CSS only — no inline styles, no CSS Modules, no styled-components
- Global styles only in `app/globals.css`
- Follow mobile-first responsive design

## Data & API
- All vehicle data must conform to `docs/vehicle-contract.md`
- No direct API calls from Client Components — use Server Actions or Server Components to fetch
- Finance engine lives in `lib/finance/` and must be pure TypeScript with no browser dependencies

## SEO
- Every page must export `generateMetadata` from the route segment
- See `docs/seo-architecture.md` for full SEO rules
- `app/sitemap.ts` and `app/robots.ts` must remain accurate

## Media
- Hero images are required on VDP pages
- 360 assets (`hero360Asset`) must never block first page render — load lazily after hydration
- Use Next.js `<Image>` for all images (never bare `<img>` tags)

## File structure
```
app/          Route segments, layouts, pages
lib/          Pure business logic (no React imports)
  finance/    Finance engine
  seo/        SEO helpers
types/        Shared TypeScript interfaces
docs/         Project specifications and rules
reference/    Locked UX reference — do not edit without explicit approval
```

## What must not change without explicit approval
- `reference/locked-ux/` — locked VDP UX reference
- `types/vehicle.ts` vehicle contract fields (additions are OK; removals require review)
- `app/robots.ts` and `app/sitemap.ts` core structure
