# Runtime Reconciliation (P0-11)

Date: March 31, 2026

## Command
- `npm run ops:reconcile`

Optional:
- `npm run ops:reconcile -- reports/reconcile.json`
- `npm run ops:reconcile -- reports/reconcile.json --strict`

## What It Validates
- Finance terminal records include an error (`failed`, `dead_letter`).
- Acknowledged finance records include provider reference.
- Failed webhook records include an error.
- Processed webhook records include `processed_at`.
- Sent CRM dispatch rows include `delivered_at`.
- CRM dead-letter rows include an error.

## Output
- JSON report with:
  - `totals`
  - `mismatches`
  - `criticalMismatchCount`
  - `verdict` (`PASS` or `FAIL`)

## CI/Operations Use
- Use `--strict` for gated checks.
- Attach report output to execution-board evidence for P0-11.
