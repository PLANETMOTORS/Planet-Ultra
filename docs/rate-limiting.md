# Distributed Rate Limiting

Date: March 31, 2026

## Goal
- Protect high-risk write APIs from abuse using Upstash Redis-backed counters.

## Protected Endpoints
- `POST /api/finance/submit` → policy `finance_submit` (`5` requests / `60s`)
- `POST /api/purchase/submit` → policy `purchase_submit` (`5` requests / `60s`)
- `POST|DELETE /api/saved-vehicles` → policy `saved_vehicles_write` (`30` requests / `60s`)
- `POST /api/vehicle-views` → policy `vehicle_views_ingest` (`20` requests / `60s`)

## Behavior
- On limit exceed: HTTP `429` with:
  - `Retry-After`
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Policy`
- If Upstash env vars are missing, limiter fails open (no blocking) to avoid production outages.

## Required Env
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
