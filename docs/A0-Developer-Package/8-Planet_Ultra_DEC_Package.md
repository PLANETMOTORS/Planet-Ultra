# 8 — Planet Ultra DEC Package (Decision Engineering Control)

## Purpose
Central decision register to prevent conflicting direction across PM, engineering, and vendor setup.

## Decision Record Template
| Field | Required |
|---|---|
| DEC ID | Yes |
| Date | Yes |
| Decision Topic | Yes |
| Context | Yes |
| Options Considered | Yes |
| Final Decision | Yes |
| Why This Decision | Yes |
| Risks Introduced | Yes |
| Mitigations | Yes |
| Owner | Yes |
| Review Date | Yes |
| Rollback Path | Yes |

## Active DEC List
| DEC ID | Topic | Decision | Owner | Status |
|---|---|---|---|---|
| DEC-001 | Staging domain | `dev.planetmotors.ca` is staging truth | PM | APPROVED |
| DEC-002 | Production domain | `www.planetmotors.ca` is launch target | PM | APPROVED |
| DEC-003 | Auth provider | Clerk for customer auth and protected routes | Eng Lead | APPROVED |
| DEC-004 | DB provider | Neon Postgres as persistence truth | Eng Lead | APPROVED |
| DEC-005 | Deposit provider | Stripe checkout + webhook reconciliation | Payments Eng | APPROVED |
| DEC-006 | Social proof counter | Upstash Redis for vehicle views | Backend Eng | APPROVED |
| DEC-007 | Delivery strategy | Continue from current A5 baseline; no full rewrite | PM + Eng Lead | APPROVED |

## Mandatory DEC Triggers
- Provider change.
- Domain/canonical change.
- Data schema breaking change.
- Auth or payment flow behavior change.
- Security/compliance policy change.

## Governance Rule
- If no DEC exists for a high-impact change, merge is blocked.
