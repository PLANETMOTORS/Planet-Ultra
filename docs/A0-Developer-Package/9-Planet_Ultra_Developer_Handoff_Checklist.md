# 9 — Planet Ultra Developer Handoff Checklist

## Objective
Ensure every feature handoff is production-safe, testable, and reversible.

## Handoff Checklist
| Area | Check | Status |
|---|---|---|
| Scope | Ticket acceptance criteria clearly met | ☐ |
| Code | PR merged with review resolution | ☐ |
| Quality | `lint`, `typecheck`, `build` pass | ☐ |
| Runtime | Affected routes tested in live env | ☐ |
| Auth | Protected behavior verified (if applicable) | ☐ |
| Data | Migrations applied and verified | ☐ |
| Payments | Webhook and idempotency tested | ☐ |
| Integrations | Provider env vars validated | ☐ |
| Observability | Logs/errors/alerts checked post-deploy | ☐ |
| Rollback | Rollback command/path documented | ☐ |
| Docs | BlueSheet + Gate Tracker updated | ☐ |
| PM Signoff | Product owner accepted evidence | ☐ |

## A5 Mandatory Additions
- Auth: browser proof for `/sign-in` and protected route redirect behavior.
- Saved Vehicles: authenticated browser save/read/delete proof, not API-only proof.
- Stripe: success/cancel/retry paths and webhook reconciliation proof.
- Webhooks: signed delivery and replay behavior evidence.

## Evidence Pack (Attach Every Time)
- Route/API test outputs.
- Screenshots for UX-critical flows.
- Relevant provider dashboard screenshots/log IDs.
- Any known limitation with explicit follow-up owner/date.

## Release Blockers
- Any `500` in core journey routes.
- Any missing required environment variable for released feature.
- Any unsigned webhook acceptance.
- Any unresolved P1/P2 finding in release scope.
