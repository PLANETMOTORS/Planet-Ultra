# 10 — Planet Ultra A6 Target Architecture Adoption

Date: March 27, 2026  
Scope: Convert brainstorm/proposal architecture into an executable A6 backlog without corrupting A5 truth reporting.

## Rule
- This document is a **target-state adoption plan**.
- It is not used as evidence to close A5 gates.
- A5 closure remains controlled by BlueSheet + Gates Tracker.

## Adoption Matrix
| Item | Classification | Reason | Owner |
|---|---|---|---|
| Protected route redirect behavior | Adopt Now (A5 close) | Already live and must remain stable | App Eng |
| Saved vehicles auth boundary + Neon persistence proof | Adopt Now (A5 close) | Required A5 blocker closure | Backend Eng |
| Stripe success/cancel/retry + webhook reconciliation proof | Adopt Now (A5 close) | Required A5 blocker closure | Payments Eng |
| Webhook signature + replay/idempotency evidence | Adopt Now (A5 close) | Required A5 blocker closure | Backend Eng |
| Purchase state machine (`initiated -> reconciled`) | Adopt in A6 | Strong pattern, needs implementation audit by repo truth | Backend Eng |
| Finance state machine (`submitted -> dead_letter`) | Adopt in A6 | Strong pattern, needs implementation audit by repo truth | Integrations Eng |
| Centralized `webhook_events` audit table | Adopt in A6 | Improves reliability and forensic traceability | Backend Eng |
| Typed stable API error contract across all write routes | Adopt in A6 | Improves client reliability and observability | App + Backend |
| RSS inventory feed endpoint | Later (A7+) | Useful for distribution, not critical path for A5/A6 close | SEO Eng |
| Advanced analytics chart components | Later (A7+) | Nice-to-have after commerce reliability baseline | Product Eng |

## A6 Work Packages
1. `A6-WP1` State Machine Runtime:
- Implement typed transition guards for purchase + finance.
- Add tests for illegal transitions.

2. `A6-WP2` Webhook Durability:
- Persist all inbound events.
- Enforce idempotency key uniqueness by provider/event id.
- Add replay and duplicate behavior tests.

3. `A6-WP3` Contract Standardization:
- Unify API error envelope.
- Add validation schema consistency checks.

4. `A6-WP4` Observability Baseline:
- Add structured logs for checkout, finance, webhook flows.
- Add minimum alert paths for failed webhook processing.

## Exit Criteria (A6)
- All A6 work packages have code + test + live evidence links.
- No A6 package item can be marked complete without runtime proof.
- A5 docs remain unchanged except for evidence-backed status updates.
