# Cache and Revalidation Strategy

## Route Revalidation

| Route | Strategy | Revalidate | Rationale |
|-------|---------|-----------|-----------|
| `/` | Static (○) | — | Homepage copy rarely changes; deploy to update |
| `/inventory` | ISR (○) | 5m | Inventory availability changes frequently |
| `/inventory/used/[make]/[model]/[slug]` | Dynamic (ƒ) | 5m (when data layer wired) | Per-vehicle facts from Postgres; status/price may change |
| `/inventory/[slug]` | Dynamic (ƒ) | force-dynamic | Redirect helper; must always resolve current slug |
| `/sitemap.xml` | Static (○) | — | Rebuild on deploy; future: ISR with vehicle data |
| `/robots.txt` | Static (○) | — | Rebuild on deploy |

## Implementation Notes

- `export const revalidate = 300` on inventory and VDP pages sets ISR TTL to 5 minutes.
- `export const dynamic = 'force-dynamic'` on the helper redirect ensures it always resolves the current vehicle slug. Remove when a stable slug-to-canonical mapping cache can be established.
- `cacheComponents: true` was removed from `next.config.ts` because it is incompatible with route-level `revalidate` and `dynamic` segment configs in Next.js 16 Turbopack.

## Future: Postgres-driven Sitemap Cache

When `getCanonicalVdpUrls()` in `app/sitemap.ts` is wired to Postgres:
- Add `export const revalidate = 3600` to the sitemap (rebuild hourly)
- Use `lastModified` from `vehicles.updated_at` to enable conditional crawling

## Future: On-demand Revalidation

When vehicle status changes (sold, price update), trigger:
```
revalidatePath('/inventory/used/[make]/[model]/[slug]')
revalidatePath('/inventory')
revalidatePath('/sitemap.xml')
```
This keeps cache coherent without relying solely on TTL expiry.
