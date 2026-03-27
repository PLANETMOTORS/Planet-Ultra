# 3 — Planet Ultra BlueSheet

## Purpose
Single-page execution truth sheet for A1–A5 with strict PASS/FAIL evidence.

## Current Delivery Model
- Environment: `dev.planetmotors.ca` (staging truth).
- Production target: `www.planetmotors.ca` (later cutover).
- Rule: no phase can be marked complete without runtime proof + dependency proof.
- Current execution mode: `A5 stabilization + extension` on existing codebase (no rewrite).

## A5 Pass/Fail Matrix (Strict)
| Workstream | Status | Evidence Required to Close |
|---|---|---|
| A5.1 Auth (Clerk) | Partial | Live sign-in success + protected route redirect proof + webhook delivery proof |
| A5.2 Saved Vehicles (Neon) | Partial/Scaffolded | `DATABASE_URL` valid, migration applied, authenticated save/read/delete browser proof |
| A5.3 Purchase/Deposit (Stripe) | Partial | Live checkout creation, success/cancel return handling, webhook reconciliation proof |
| A5.4 Finance Submission | Partial | Valid payload queue proof + CRM delivery receipt + retry handling proof |
| A5.5 CRM Adapter | Partial/Deferred | Route adapters enabled, delivery logs, retry + dead-letter handling proof |
| A5.6 Social Proof (Redis) | Partial | Real increment/read behavior under repeated requests + anti-abuse policy proof |
| A5.7 Webhooks | Partial | Signed requests accepted/rejected correctly + replay/idempotency behavior proof |

## Known Critical Note
- Saved-vehicles persistence is still fallback behavior when Neon is not fully provisioned. Without working Neon path, API returns safe empty/false responses and does not persist.

## A5 Operating Rule (March 27, 2026)
1. Do not restart project from scratch.
2. Close blockers on current baseline first.
3. Ship extensions as isolated branches after blocker closure.
4. Any item lacking dependency proof remains `Partial`.

## Required Exit Evidence Format
- Code gate: `lint`, `typecheck`, `build`.
- Runtime gate: route/API HTTP proof.
- Dependency gate: env vars + migration + provider dashboard config.
- Business gate: user flow completion (browser proof, not curl-only).

## Decision Rule
- If any dependency gate is open, the workstream remains `Partial` even if code exists.
- If browser end-to-end evidence is missing for a user flow, the workstream remains `Partial`.
