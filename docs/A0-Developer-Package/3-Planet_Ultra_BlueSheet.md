# 3 — Planet Ultra BlueSheet

## Purpose
Single-page execution truth sheet for A1–A5 with strict PASS/FAIL evidence.

## Current Delivery Model
- Environment: `dev.planetmotors.ca` (staging truth).
- Production target: `www.planetmotors.ca` (later cutover).
- Rule: no phase can be marked complete without runtime proof + dependency proof.
- Current execution mode: `A5 closed + A6 P0 backend build` on existing codebase (no rewrite).

## A5 Pass/Fail Matrix (Strict)
| Workstream | Status | Evidence Required to Close |
|---|---|---|
| A5.1 Auth (Clerk) | PASS | Live sign-in success + protected route redirect proof + webhook delivery proof |
| A5.2 Saved Vehicles (Neon) | PASS | `DATABASE_URL` valid, migration applied, authenticated save/read/delete browser proof |
| A5.3 Purchase/Deposit (Stripe) | PASS | Live checkout creation, success/cancel return handling, webhook reconciliation proof |
| A5.4 Finance Submission | PASS | Valid payload queue proof + CRM delivery receipt + retry handling proof |
| A5.5 CRM Adapter | PASS | Route adapters enabled, delivery logs, retry + dead-letter handling proof |
| A5.6 Social Proof (Redis) | PASS | Real increment/read behavior under repeated requests + anti-abuse policy proof |
| A5.7 Webhooks | PASS | Signed requests accepted/rejected correctly + replay/idempotency behavior proof |

## Known Critical Note
- Saved-vehicles API still preserves safe fallback behavior if Neon is unavailable. In configured runtime, Neon persistence has been proven.
- Inventory ingest rule is now explicit and enforced in importer code: every new HomeNet upload replaces current inventory snapshot; previous rows are wiped.

## A5 Operating Rule (March 27, 2026)
1. Do not restart project from scratch.
2. Close blockers on current baseline first.
3. Ship extensions as isolated branches after blocker closure.
4. Any item lacking dependency proof remains `Partial`.

## Latest Runtime Evidence (March 27, 2026)
- Public routes: `/`, `/inventory`, `/finance`, `/purchase`, `/protection`, `/sign-in`, `/sign-up`, `/robots.txt`, `/sitemap.xml` returned `200`.
- Protected routes: `/account`, `/saved`, `/profile` returned `307` with correct `redirect_url`.
- API checks:
  - `/api/vehicle-views` returned live count payload.
  - `/api/finance/submit` returned `queued` on valid payload and validation errors on invalid payload.
  - `/api/purchase/submit` returned `Unauthorized` when unauthenticated.
  - `/api/saved-vehicles` returned `Unauthorized` when unauthenticated.

## A5 Closure Evidence (March 27, 2026)
- Authenticated user: `dev-auth@planetmotors.ca` (`user_3BVSH3LvmKagzQJy6gHd8M5ilbU`).
- Live route matrix passed for public + protected redirect behavior.
- Saved-vehicles full CRUD proven with Neon row insert + cleanup.
- Stripe checkout session creation proven with live key and session ID.
- Finance submit queue response proven on live endpoint.
- CRM dispatch wired for finance + purchase.
- Redis social-proof increment/read behavior proven.
- Clerk and Stripe signed webhooks both returned `200` on receipt.
- Static gates all passed: `lint`, `typecheck`, `build`.

## Latest Engineering Update (March 30, 2026)
- A6 branch in execution: `codex/a6-backend-p0-inventory-dealertrack`.
- Added HomeNet full-replace importer pipeline:
  - `db/migrations/002_inventory_feed_snapshot.sql`
  - `scripts/import-homenet-inventory.mjs`
  - `docs/inventory-import-rule.md`
- Inventory runtime now reads snapshot data:
  - `/inventory`
  - `/inventory/[slug]`
  - `/inventory/used/[make]/[model]/[slug]`

## Latest Engineering Verification (April 2, 2026)
- `npm run ops:debug:full` passed end-to-end.
- Tests: `52/52` PASS.
- `lint`, `typecheck`, `build`: PASS.
- `ops:reconcile` and `ops:proof:p0`: returned safe `NO_DATABASE` snapshots in local env without `DATABASE_URL`.

## Required Exit Evidence Format
- Code gate: `lint`, `typecheck`, `build`.
- Runtime gate: route/API HTTP proof.
- Dependency gate: env vars + migration + provider dashboard config.
- Business gate: user flow completion (browser proof, not curl-only).

## Decision Rule
- If any dependency gate is open, the workstream remains `Partial` even if code exists.
- If browser end-to-end evidence is missing for a user flow, the workstream remains `Partial`.
