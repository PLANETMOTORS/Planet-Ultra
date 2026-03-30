# 5 — Planet Ultra PreProject Gates Tracker

## Gate Ledger
Use this tracker weekly. A gate is PASS only with objective evidence.

| Gate ID | Area | Condition | Owner | Evidence | Status |
|---|---|---|---|---|---|
| G-01 | Repo Hygiene | No secrets, no build artifacts in git | Eng Lead | Secret scan + git check | OPEN |
| G-02 | Code Quality | `lint/typecheck/build` all pass | Eng Lead | CI logs | OPEN |
| G-03 | Domain Integrity | Only `dev.planetmotors.ca` for staging references | Eng Lead | grep report | OPEN |
| G-04 | Auth Runtime | `/sign-in` live and protected routes redirect correctly | App Eng | browser + HTTP logs | PASS |
| G-05 | Neon Persistence | `DATABASE_URL` valid + migration done + CRUD proven | Backend Eng | SQL editor + API/browser proof | OPEN |
| G-06 | Stripe Runtime | Checkout + webhook success/cancel flows proven | Payments Eng | Stripe events + app logs | OPEN |
| G-07 | Redis Runtime | Real view counters with anti-abuse behavior | Backend Eng | API logs + rate tests | PASS |
| G-08 | CRM Delivery | Finance/purchase events reach CRM with receipts | Integrations Eng | delivery logs | OPEN |
| G-09 | Webhook Security | Signature verification + replay defense proven | Backend Eng | test script evidence | OPEN |
| G-10 | Route Reliability | All public routes return expected status codes | QA | route matrix test | PASS |
| G-11 | Observability | Error reporting/alerts enabled for prod-critical APIs | SRE | alert policy + sample alert | OPEN |
| G-12 | Release Readiness | Rollback steps documented and tested | PM + Eng | rollback runbook | OPEN |

## Scoring Model
- Gate score = `PASS = 1`; all other statuses (`IN_PROGRESS`, `OPEN`, `PARTIAL`) = `0`.
- Pre-launch minimum: `G-01` to `G-10` all PASS.
- Final go-live: all gates PASS.

## Status Legend (Strict)
- `PASS`: verified with objective evidence.
- `IN_PROGRESS`: work underway but not yet proven.
- `OPEN`: not started or blocked.
- `PARTIAL`: implemented in code but blocked by dependency or missing runtime proof.

## Latest Verification Snapshot (March 27, 2026)
- G-04 PASS: `/sign-in` returned `200`; protected routes returned `307` to sign-in with preserved redirect.
- G-07 PASS: `/api/vehicle-views` returned real count payload (`viewCount24h` observed).
- G-10 PASS: full public route check returned expected HTTP status codes.

## Startup Update (March 30, 2026)
- Execution started using master board:
  - `docs/A0-Developer-Package/11-Planet_Ultra_Master_Execution_Board.md`
- Current startup focus gates:
  - G-05 Neon Persistence (`IN_PROGRESS`)
  - G-06 Stripe Runtime (`IN_PROGRESS`)
  - G-09 Webhook Security (`IN_PROGRESS`)
  - G-11 Observability (`IN_PROGRESS`)
