# Ops Health Endpoint

Date: March 31, 2026

## Endpoint
- `GET /api/ops/health`

## Auth
- Header: `x-ops-secret: <OPS_API_SECRET>`
- If `OPS_API_SECRET` is set, requests without matching header return `401`.

## Response
- Timestamped operational snapshot:
  - inventory row count
  - finance submission totals + dead-letter count
  - webhook received + failed count
  - CRM sent + dead-letter count

## Use
- Execution board evidence for:
  - P0-02 inventory pipeline
  - P0-03 finance lifecycle
  - P0-06 webhook durability
  - P0-10 CRM delivery receipts
  - P0-08 observability baseline

## Related Commands
- `npm run ops:alerts`
  - Produces an alert snapshot from DB-backed counters.
  - Use with `--require-db --strict` in closeout pipelines.
- `npm run ops:reconcile`
  - Produces lifecycle mismatch report.
- `npm run ops:close:a6`
  - Runs quality gates + reconcile + proof pack + alerts + security checks and writes artifacts.
