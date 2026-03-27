# 6 — Planet Ultra Doc3 Schema API Blueprint

## Data Model (Core Entities)
- `users` (identity anchor; maps to Clerk user id)
- `profiles` (customer details and preferences)
- `vehicles` (catalog truth)
- `vehicle_media` (images/spin assets metadata)
- `saved_vehicles` (user-to-vehicle relationship)
- `finance_applications` (submission lifecycle)
- `purchase_sessions` (deposit/checkout lifecycle)
- `webhook_events` (idempotency + audit trail)
- `vehicle_view_events` (social proof counters/events)

## Minimal ERD Rules
- `saved_vehicles.user_id -> users.id` (FK)
- `saved_vehicles.vehicle_id -> vehicles.id` (FK)
- `finance_applications.user_id -> users.id` (FK)
- `purchase_sessions.user_id -> users.id` (FK)
- `purchase_sessions.vehicle_id -> vehicles.id` (FK)
- Unique constraint on `(user_id, vehicle_id)` in `saved_vehicles`
- Indexes on `vehicles(make, model, year, price)` and event timestamps

## API Surface (A5)
- `GET/POST/DELETE /api/saved-vehicles`
- `GET/POST /api/vehicle-views`
- `POST /api/finance/submit`
- `POST /api/purchase/submit`
- `POST /api/webhooks/clerk`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/{autoraptor|dealertrack|routeone|sanity}`

## API Contracts (Required)
- Request validation on every write endpoint.
- Stable error shape:
```json
{ "error": "string", "code": "optional_code", "issues": [] }
```
- Auth-required endpoints must return `401` when unauthenticated.
- All webhook endpoints must verify signature and reject invalid payloads.

## State Machines
### Purchase Session
`initiated -> checkout_created -> paid|expired|cancelled -> reconciled`

### Finance Application
`submitted -> queued -> forwarded -> acknowledged|failed -> retried|dead_letter`

## Data Safety Controls
- No card data stored in app DB.
- Webhook event idempotency key required.
- PII retention and deletion policy defined before production cutover.

## Acceptance
- Schema migration files in repo and reproducible in Neon.
- Endpoint contracts documented and tested.
- End-to-end flow proof captured for auth, save, finance, purchase.
