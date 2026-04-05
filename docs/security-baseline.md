# Security Baseline Checks

Date: April 2, 2026

## Goal
- Fail closed on webhook authentication.
- Validate secret/config posture before phase closeout.

## Command
- `npm run ops:security:check`

## Strict Mode
- `node scripts/security-baseline-check.mjs <output-path> --require-secrets`
- Returns non-zero when required secrets are missing.

## Checks Included
- Required webhook and ops secrets:
  - `CLERK_WEBHOOK_SECRET`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_SECRET_KEY`
  - `OPS_API_SECRET`
  - `DEALERTRACK_WEBHOOK_SECRET`
  - `ROUTEONE_WEBHOOK_SECRET`
  - `DELIVERY_WEBHOOK_SECRET`
  - `TRADEIN_WEBHOOK_SECRET`
  - `AUTORAPTOR_WEBHOOK_SECRET`
- Integration flag/key pairing validation:
  - `ENABLE_ROUTEONE` with `ROUTEONE_API_KEY`
  - `ENABLE_DEALERTRACK` with `DEALERTRACK_API_KEY`
  - `ENABLE_AUTORAPTOR` with `AUTORAPTOR_API_KEY`
- Wildcard image-host bypass warning:
  - `NEXT_PUBLIC_ALLOW_ALL_IMAGE_HOSTS=1` flagged as warning for production posture.

## Webhook Hardening
- RouteOne, Dealertrack, and AutoRaptor webhook handlers now fail closed:
  - Missing webhook secret => `500` (misconfiguration)
  - Secret mismatch => `401`
- Stripe webhook now requires both:
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_SECRET_KEY`
