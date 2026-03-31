# AutoRaptor Integration Prep (Ready for Vendor Call)

Date: March 31, 2026  
Owner: Integrations / Backend

## Goal
Be ready to complete AutoRaptor integration immediately once vendor specs and credentials are provided.

## Current Runtime Status
- Adapter implemented: `lib/crm/autoraptor.ts`
- Receipt logging implemented: `lib/crm/dispatchStore.ts`
- Dispatch sources wired:
  - `app/api/finance/submit/route.ts`
  - `app/api/purchase/submit/route.ts`
- Feature flag:
  - `ENABLE_AUTORAPTOR=0` (safe default)

## What We Need From AutoRaptor (Tomorrow)
1. Base API URL for production and sandbox.
2. Authentication method:
 - Bearer token, API key header name, token rotation policy.
3. Lead create endpoint and schema (required vs optional fields).
4. Rate limits and retry guidance.
5. Delivery guarantees:
 - synchronous accepted vs queued.
6. Error contract:
 - 4xx/5xx structure and retryable error list.
7. Webhook/callback spec (if supported):
 - headers, signature verification method, replay protection guidance.
8. Certification/UAT checklist and pass criteria.
9. IP allowlist requirements (if any).
10. SLA and support escalation contacts.

## Environment Variables (Ready)
- `AUTORAPTOR_API_URL`
- `AUTORAPTOR_API_KEY`
- `AUTORAPTOR_WEBHOOK_SECRET`
- `ENABLE_AUTORAPTOR`

## Planet Ultra Event Mapping (Current)
- `soft_lead` -> `lead_type: Internet`
- `finance_lead` -> `lead_type: Finance`
- `purchase_deposit` -> `lead_type: Deposit`
- `vehicle_view` -> `lead_type: VehicleView`

## Payload Fields (Current Outbound)
- Vehicle:
  - `year`, `make`, `model`, `stock_number`
- Event metadata:
  - `occurred_at`, `source`
- Optional PII:
  - `first_name`, `last_name`, `email`, `phone`
- Optional metadata:
  - `meta`

## Evidence Pack We Will Produce After Credentials
1. Successful finance lead dispatch with provider reference ID.
2. Successful purchase deposit dispatch with provider reference ID.
3. Retry behavior proof on simulated 5xx.
4. Dead-letter proof on repeated hard failures.
5. Dispatch log proof:
 - `crm_dispatch_log` rows show status, attempts, provider reference.

## Go-Live Sequence
1. Set `AUTORAPTOR_API_URL`, `AUTORAPTOR_API_KEY`.
2. Set `ENABLE_AUTORAPTOR=1` in staging only.
3. Send controlled test leads (finance + purchase).
4. Validate receipts and references in `crm_dispatch_log`.
5. Capture evidence screenshots/logs.
6. Promote same config pattern to production.

## Risk Controls
- Keep feature flag off until vendor contract confirmed.
- Do not log PII in server logs.
- Keep failed dispatches visible via `crm_dispatch_log.dead_letter`.
- Maintain non-blocking behavior in finance/purchase APIs.
