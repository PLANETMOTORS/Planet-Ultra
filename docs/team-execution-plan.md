# Team Execution Plan — PLANETMOTORS/Planet-Ultra

## Repo & Agent Ownership

| Role | Tool | Repo |
|---|---|---|
| Primary rebuild | Cursor Agent | `PLANETMOTORS/Planet-Ultra` |
| Legacy maintenance | Claude Code | `PLANETMOTORS/Website` |

These are **separate repos on separate Vercel projects**. Work must not cross between them.

---

## Build Priorities (in order)

1. **Locked VDP rebuild** — Vehicle Detail Page matching reference UX in `reference/locked-ux/`
2. **Inventory rebuild** — listing page, filters, search
3. **Sell / Trade rebuild** — lead capture, form flow
4. **Server-first SEO** — `generateMetadata` on every route, structured data
5. **Fast image delivery** — Next.js `<Image>`, CDN optimization
6. **360 media** — deferred, never in critical render path

---

## Execution Phases

### Phase 1 — Foundation (complete)
- Next.js 16 App Router scaffold
- Vehicle data contract (`types/vehicle.ts`)
- Finance engine (`lib/finance/`)
- SEO helpers (`lib/seo/`)
- Global styles, layout, homepage shell

### Phase 2 — VDP (active)
- Build VDP route matching locked-ux reference
- Hero image, gallery, pricing, finance calculator
- `generateMetadata` for VDP
- 360 asset lazy-load integration

### Phase 3 — Inventory
- Inventory listing route
- Vehicle cards matching brand design
- Filter/search UI (client-side first, then server-side)
- Pagination

### Phase 4 — Sell / Trade
- Multi-step form flow
- Lead capture integration

### Phase 5 — SEO & Performance
- Sitemap generation (dynamic from inventory)
- Structured data (JSON-LD) on VDP and inventory
- Core Web Vitals audit and fixes

---

## How Cursor Agent should work in this repo

1. Read `AGENTS.md` before starting any task.
2. Check `docs/vehicle-contract.md` before touching any vehicle data shape.
3. Follow branch naming from `docs/branch-rules.md`.
4. Run `npm run lint && npm run typecheck` before committing.
5. Open a PR for every branch — never commit directly to `main`.
6. Leave the dev server running (`npm run dev` on port 3000).

---

## Deployment Flow

```
Cursor Agent branch → PR → Review → Merge to main → Vercel auto-deploys → dev.planetmotors.ca
```

Preview URLs are generated automatically for every PR branch by Vercel.
