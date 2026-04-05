# Site Performance Audit

- Generated At: 2026-04-05T16:39:01.569Z
- Threshold: < 200ms
- Attempts per route: 3
- Routes audited: 25

## LOCAL (http://localhost:4031)

- Speed pass: 25/25 (100%)
- Status pass: 25/25 (100%)
- Strict pass: 25/25 (100%)

All routes passed strict checks.

## DEV (https://dev.planetmotors.ca)

- Speed pass: 25/25 (100%)
- Status pass: 10/25 (40%)
- Strict pass: 10/25 (40%)

| Route | Status | Avg ms | Max ms | Issue |
|---|---:|---:|---:|---|
| `/sell-or-trade` | 404 | 37 | 38 | status 404 |
| `/how-it-works` | 404 | 38 | 43 | status 404 |
| `/about` | 404 | 38 | 41 | status 404 |
| `/faq` | 404 | 38 | 46 | status 404 |
| `/locations` | 404 | 38 | 40 | status 404 |
| `/reviews` | 404 | 37 | 40 | status 404 |
| `/delivery` | 404 | 39 | 40 | status 404 |
| `/returns` | 404 | 38 | 40 | status 404 |
| `/compare` | 404 | 39 | 41 | status 404 |
| `/contact` | 404 | 38 | 42 | status 404 |
| `/blog` | 404 | 37 | 38 | status 404 |
| `/blog/how-to-buy-used-car-online-ontario` | 404 | 50 | 72 | status 404 |
| `/blog/trade-in-vs-private-sale` | 404 | 36 | 37 | status 404 |
| `/blog/vehicle-protection-plans-explained` | 404 | 52 | 67 | status 404 |
| `/admin` | 404 | 38 | 42 | status 404 |

