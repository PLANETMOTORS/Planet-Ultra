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
