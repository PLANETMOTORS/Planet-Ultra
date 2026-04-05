# Ops Alerting Baseline

Date: April 2, 2026

## Goal
- Provide deterministic alert evidence for A6/P0-08 closeout.
- Convert lifecycle health counters into actionable alert outputs.

## Command
- `npm run ops:alerts`

## Strict Mode
- `node scripts/check-ops-alerts.mjs <output-path> --require-db --strict`
- Returns non-zero when alert conditions are present.

## Default Thresholds
- `ALERT_FINANCE_DEAD_LETTER_MAX=0`
- `ALERT_WEBHOOK_FAILED_MAX=0`
- `ALERT_CRM_DEAD_LETTER_MAX=0`
- `ALERT_DELIVERY_FAILED_MAX=0`
- `ALERT_INVENTORY_STALE_HOURS_MAX=24`

## Output
- Snapshot counters:
  - finance dead-letter count
  - webhook failed count
  - CRM dead-letter count
  - delivery failed count
  - inventory row count
  - inventory stale age (hours)
- Alert list with:
  - code
  - severity
  - current value
  - threshold max
- Verdict:
  - `PASS` when no alerts
  - `ALERT` when one or more thresholds are exceeded
  - `NO_DATABASE` when DB is unavailable and strict mode is not requested
