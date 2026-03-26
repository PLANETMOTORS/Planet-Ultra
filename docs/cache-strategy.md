# Cache Strategy — PLANETMOTORS/Planet-Ultra

## Approach
Next.js 16 App Router fetch caching with revalidation. No manual cache headers required for most routes.

## Route-level caching

| Route | Strategy | Revalidation |
|---|---|---|
| Homepage | ISR | `revalidate = 300` (5 min) |
| Inventory listing | ISR | `revalidate = 120` (2 min) |
| VDP (`/inventory/[slug]`) | ISR | `revalidate = 60` (1 min) |
| Sell / Trade form | No cache | `dynamic = 'force-dynamic'` |
| Sitemap | ISR | `revalidate = 3600` (1 hr) |

## Data fetch caching

```ts
// Inventory feed — revalidate every 2 minutes
const data = await fetch(INVENTORY_API_URL, {
  next: { revalidate: 120 },
})
```

## Image caching
- Next.js `<Image>` handles CDN caching automatically
- Hero images: served from Vercel Edge Network
- 360 assets: loaded client-side after hydration — not subject to ISR

## What not to do
- Do not use `cache: 'no-store'` on inventory or VDP routes (kills ISR)
- Do not fetch inside Client Components — fetch in Server Components and pass data as props
- Do not set manual `Cache-Control` headers unless you have a specific measured reason
