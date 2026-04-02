# CRM Evidence Proof (P0-10)

Date: April 2, 2026

## Goal
- Produce objective evidence for CRM delivery receipts, retry visibility, and dead-letter safety.

## Command
- `npm run ops:proof:crm`

## Strict Mode
- `node scripts/generate-crm-evidence.mjs <output-path> --require-db --strict`
- Returns non-zero unless CRM evidence verdict is `PASS_CANDIDATE`.

## Snapshot Fields
- Total rows, sent/queued/disabled/failed counts
- Dead-letter count
- Sent rows missing `delivered_at`
- Failed/dead-letter rows missing `error_message`
- Attempt-count distribution and average attempts
- Breakdown by provider and source
- Recent failed rows for triage

## Verdict Logic
- `PASS_CANDIDATE` when:
  - `deadLetter = 0`
  - `sentMissingDeliveredAt = 0`
  - `failedMissingError = 0`
- Otherwise: `IN_PROGRESS`
- If DB unavailable and strict mode is off: `NO_DATABASE`
