# 4 — Planet Ultra PreProject Developer Requirements

## Goal
Lock engineering standards before active delivery to prevent rework.

## Current Phase Note
- Project is currently in `A5` execution.
- Delivery approach is iterative hardening on existing baseline code, not rebuild.

## Required Stack
- Frontend: Next.js App Router + TypeScript.
- Auth: Clerk.
- Database: Neon Postgres.
- Cache/Rate/Event counters: Upstash Redis.
- Payments: Stripe.
- CMS/content hooks: Sanity (where applicable).
- Runtime hosting: Vercel.

## Engineering Standards
- Strict TypeScript in all app and API modules.
- Server-side validation for every write endpoint.
- No business logic in UI components.
- Feature flags for vendor-gated modules.
- Idempotency on payment/order webhook-critical operations.

## Security Baseline
- TLS enforced, no plaintext secrets in repo.
- Admin MFA required.
- Principle of least privilege for dashboards and service accounts.
- Sensitive APIs protected by auth + rate limiting + payload validation.

## Branch & Merge Policy
- Branch naming: `fix/*`, `feat/*`, `docs/*`.
- Required checks: `npm run lint`, `npm run typecheck`, `npm run build`.
- No merge on unresolved critical review findings.
- No phase-close claim without live verification evidence.

## Definition of Ready (Developer Task)
- Clear acceptance criteria.
- Dependencies listed (env vars, provider accounts, migration, webhooks).
- Test plan included (unit/integration/live).
- Rollback plan included for production-impacting changes.

## Definition of Done (Developer Task)
- Code complete and reviewed.
- Gates pass in CI.
- Live proof captured for impacted routes/APIs.
- Documentation updated in BlueSheet + Gate Tracker.
