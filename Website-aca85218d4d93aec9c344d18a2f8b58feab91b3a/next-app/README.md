# Planet Motors — Next.js SSR Platform

## Setup

```bash
cd next-app
npm install
cp .env.example .env.local
# Fill in your HomeNet IOL and DriveEai credentials in .env.local
npm run dev
```

## Vercel Deployment

1. In Vercel dashboard → **Add New Project** → import this repo
2. Set **Root Directory** to `next-app`
3. Add environment variables (see `.env.example`):
   - `HOMENET_DEALER_ID`
   - `HOMENET_API_KEY`
   - `DRIVEAI_DEALER_ID`
   - `DRIVEAI_API_KEY`
4. Deploy

## HomeNet IOL Integration

- Feed runs on **5-minute revalidation** (ISR)
- Sold vehicles auto-removed from sitemap
- Phase 2 sold (days 1–30): "Recently Sold" badge shown, CTAs disabled
- Phase 3 sold (day 31+): 301 redirect to parent make/model SRP

## DriveEai Integration

- AI-enhanced pricing badges ("GREAT PRICE", "HIGH DEMAND")
- Market price comparison for price-drop badges
- Takes priority over HomeNet on duplicate VINs

## Key Routes

| Route | Type | Description |
|-------|------|-------------|
| `/inventory/used/` | SSR | Full inventory SRP |
| `/inventory/used/[make]/` | SSR | Make hub |
| `/inventory/used/[make]/[model]/` | SSR | Model hub |
| `/inventory/used/[make]/[model]/[slug]/` | SSR | VDP |
| `/sitemap.xml` | Dynamic | Auto-generates from live inventory |
| `/robots.txt` | Dynamic | Points to sitemap |
