# 11 — Planet Ultra Master Execution Board (Startup)

Date: March 30, 2026  
Mode: Execution Start  
Rule: No item moves to `PASS` without linked runtime evidence.

## Priority Board

| ID | Priority | Workstream | Owner | Proof Required | Status |
|---|---|---|---|---|---|
| P0-01 | P0 | Conversion pages 25/25 | Frontend Lead | Route matrix + screenshots | IN_PROGRESS |
| P0-02 | P0 | Inventory ingest + retry + dead-letter + reconciliation | Backend Lead | Daily ingest report + replay proof | IN_PROGRESS |
| P0-03 | P0 | Dealertrack full lifecycle | Integrations Lead | submit/ack/retry/terminal evidence | IN_PROGRESS |
| P0-04 | P0 | Finance state machine + audit trail | Backend Lead | state logs for success/fail paths | IN_PROGRESS |
| P0-05 | P0 | Stripe reconciliation loop | Payments Lead | Stripe-to-DB reconciliation report | IN_PROGRESS |
| P0-06 | P0 | Webhook idempotency + replay safety | Backend Lead | duplicate/replay/invalid-sign tests | IN_PROGRESS |
| P0-07 | P0 | Admin panel MVP | Fullstack Lead | inventory/finance/order ops demo + RBAC | OPEN |
| P0-08 | P0 | Observability baseline | SRE Lead | alerts + dashboards + sample incidents | OPEN |
| P0-09 | P0 | Security controls (WAF/rate/secrets) | Security Lead | abuse test + rotation drill evidence | OPEN |
| P0-10 | P0 | CRM delivery receipts + retry visibility | Integrations Lead | delivery dashboard + dead-letter handling | OPEN |
| P0-11 | P0 | Data correctness (totals/tax/order invariants) | Backend Lead | zero critical mismatches report | IN_PROGRESS |
| P0-12 | P0 | Gate discipline (proof-only closure) | PM + Eng Lead | BlueSheet + Gate Tracker links | IN_PROGRESS |
| P0-13 | P0 | Trade-in end-to-end | Product Eng Lead | offer/accept/inspect/complete proof | IN_PROGRESS |
| P0-14 | P0 | Delivery lifecycle end-to-end | Ops + Backend | slot/tracking/status proofs | IN_PROGRESS |
| P0-15 | P0 | 10-day return/refund workflow | Payments + Ops | return + refund settlement evidence | IN_PROGRESS |
| P1-16 | P1 | Saved searches + alerts | Frontend + Backend | create/update/notify proof | OPEN |
| P1-17 | P1 | Event contract registry + taxonomy | Platform Lead | versioned schemas + compatibility tests | OPEN |
| P1-18 | P1 | Data retention/deletion automation | Compliance Eng | SAR/delete run evidence | OPEN |
| P1-19 | P1 | Incident runbooks + escalation | SRE + PM | runbook drills + SLA timings | OPEN |
| P1-20 | P1 | Environment parity/drift controls | Platform Eng | drift report clean | OPEN |
| P1-21 | P1 | Performance budget gates | Frontend + SRE | CI budget pass (LCP/INP/CLS) | OPEN |
| P1-22 | P1 | Compliance evidence pack | Compliance Lead | audit-ready bundle | OPEN |
| P1-23 | P1 | Capacity/scale plan | SRE Lead | load targets + autoscale + failover tests | OPEN |
| P1-24 | P1 | DR drill (RTO/RPO tested) | SRE + DB Lead | restore drill report | OPEN |
| P1-25 | P1 | Release governance (freeze/canary/rollback) | PM + Eng Lead | signed policy + run evidence | OPEN |
| P1-26 | P1 | Fraud/risk workflow | Risk Lead + Backend | manual review queue + SLA report | OPEN |
| P1-27 | P1 | Legal/version controls + e-sign retention | Legal Ops + Backend | per-order legal snapshot proof | OPEN |
| P1-28 | P1 | Support incident operations | Support Lead + PM | escalation tree + comm templates + drill | OPEN |
| P1-29 | P1 | Cost governance | FinOps + SRE | dashboard + anomaly alerts | OPEN |
| P1-30 | P1 | Data lineage + ownership map | Data Lead | lineage map + owner matrix | OPEN |
| P1-31 | P1 | API backward compatibility gate | Platform Lead | contract tests in CI | OPEN |
| P1-32 | P1 | Accessibility CI gate | Frontend Lead | automated WCAG checks + fixes | OPEN |
| P1-33 | P1 | Promotion policy (dev->staging->prod) | Platform Eng | promotion checklist logs | OPEN |
| P1-34 | P1 | Post-incident process | SRE + PM | completed postmortems + action tracking | OPEN |
| P1-35 | P1 | Queue lag + consumer scaling policy | Platform Eng | lag dashboards + trigger validation | OPEN |
| P1-36 | P1 | Feature flag governance | Product Eng | lifecycle policy + stale flag cleanup | OPEN |
| P1-37 | P1 | Config drift detection | Platform Eng | scheduled drift scans | OPEN |
| P1-38 | P1 | Secret/key lifecycle controls | Security Lead | rotation cadence + drill | OPEN |
| P1-39 | P1 | PII masking in logs/replay | Security + Data | masking tests + signoff | OPEN |
| P1-40 | P1 | Consent ledger + revocation propagation | Compliance + Backend | consent audit + revocation proof | OPEN |
| P1-41 | P1 | Settlement-level payment reconciliation | Payments Lead | daily recon + variance resolution | OPEN |
| P1-42 | P1 | Retention/deletion scheduler hardening | Compliance Eng | timed execution logs | OPEN |
| P2-43 | P2 | Business continuity plan | PM + Ops | BCP drill + signoff | OPEN |
| P2-44 | P2 | Vendor SLA governance | Integrations Lead | SLA registry + expiry alerts | OPEN |
| P2-45 | P2 | Synthetic monitoring | SRE Lead | probe results + incident links | OPEN |
| P2-46 | P2 | Perf budgets as merge blocker | Frontend + SRE | CI enforcement | OPEN |
| P2-47 | P2 | Device-tier QA matrix | QA Lead | critical-path device reports | OPEN |
| P2-48 | P2 | Knowledge base + runbook index | PM + Support | published index + usage logs | OPEN |
| P2-49 | P2 | Data quality scoring | Data Lead | completeness/freshness dashboard | OPEN |
| P2-50 | P2 | Search zero-result governance | Search Lead | zero-result trend reduction | OPEN |
| P2-51 | P2 | Admin RBAC action-level authorization | Security + Fullstack | permission tests + audit proof | OPEN |
| P2-52 | P2 | Compliance evidence automation | Compliance Lead | pipeline-generated audit packs | OPEN |

## Sprint 0 (Startup, 7 Days)
1. Close P0-03, P0-05, P0-06 proof packs.
2. Progress P0-01 to minimum 16/25 conversion pages.
3. Deliver first ingest reconciliation report for P0-02.
4. Publish initial observability alerts for P0-08.

## Applied Add-Ons (March 30, 2026)
- A6 backend execution branch created: `codex/a6-backend-p0-inventory-dealertrack`.
- P0-02 implementation baseline added:
  - `db/migrations/002_inventory_feed_snapshot.sql`
  - `scripts/import-homenet-inventory.mjs`
  - `lib/inventory/repository.ts`
- Runtime wiring started:
  - `/inventory` now reads live snapshot rows.
  - `/inventory/[slug]` now resolves canonical VDP from inventory snapshot.
  - `/inventory/used/[make]/[model]/[slug]` now reads DB by slug (fixture removed).
- Inventory rule locked:
  - Every HomeNet import is full-replace (`TRUNCATE + INSERT`).
  - Previous inventory rows are not retained in `inventory_vehicles`.
- P0-15 lifecycle baseline added:
  - `db/migrations/006_purchase_lifecycle.sql`
  - `lib/purchase/lifecycleStore.ts`
  - `/api/purchase/submit` now persists lifecycle + Stripe session mapping
  - `/api/webhooks/stripe` now updates paid/expired/refunded states in lifecycle store
  - `/api/purchase/return` added for 10-day return request initiation
- P0-14 lifecycle baseline added:
  - `db/migrations/007_delivery_lifecycle.sql`
  - `lib/delivery/lifecycleStore.ts`
  - `/api/purchase/delivery` added for customer scheduling + status retrieval
  - `/api/webhooks/delivery` added for provider status updates (`scheduled/confirmed/in_transit/delivered/failed/cancelled`)
- P0-13 lifecycle baseline added:
  - `db/migrations/008_tradein_lifecycle.sql`
  - `lib/tradein/lifecycleStore.ts`
  - `/api/trade-in/offer`, `/api/trade-in/accept`, `/api/trade-in/status` added
  - `/api/webhooks/tradein` added for inspected/completed terminal provider updates
  - `/sell-or-trade` route created (was previously linked but missing)
- P0-05/P0-06 evidence hardening baseline added:
  - `scripts/reconcile-runtime-health.mjs` now validates purchase/delivery/trade-in lifecycle invariants
  - `lib/ops/metrics.ts` now exposes purchase/delivery/trade-in operational counters
  - Added regression tests for ops evidence wiring

## Non-Negotiable Rules
- One workstream per branch/PR.
- No completion claims without evidence links.
- Dependency gap = `OPEN` or `IN_PROGRESS` (never `PASS`).
