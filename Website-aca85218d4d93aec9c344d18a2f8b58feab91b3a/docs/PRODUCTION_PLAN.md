# Planet Motors — Production Platform Implementation Plan

**Status:** Architecture Directive — Approved for Execution
**Last updated:** 2026-03-16
**Repo:** PLANETMOTORS/Website
**Branch:** `claude/fix-ratings-html-leak-XjcOo`
**Architect:** Platform Lead

---

## Table of Contents

1. [Executive Recommendation](#1-executive-recommendation)
2. [Final Architecture](#2-final-architecture)
3. [Why Sanity is the Correct Choice for Planet Motors](#3-why-sanity-is-the-correct-choice-for-planet-motors)
4. [CMS Scope](#4-cms-scope)
5. [Inventory / Feed Scope](#5-inventory--feed-scope)
6. [Admin / Operations Scope](#6-admin--operations-scope)
7. [Full Schema List](#7-full-schema-list)
8. [Roles and Permissions Model](#8-roles-and-permissions-model)
9. [Source-of-Truth Matrix](#9-source-of-truth-matrix)
10. [Migration Phases](#10-migration-phases)
11. [Acceptance Criteria by Phase](#11-acceptance-criteria-by-phase)
12. [Risks, Controls, and Rollback Considerations](#12-risks-controls-and-rollback-considerations)
13. [Future-Ready Capabilities Included from Day One](#13-future-ready-capabilities-included-from-day-one)
14. [Final Handoff Model](#14-final-handoff-model)

---

## 1. Executive Recommendation

Planet Motors is taking full ownership of its digital platform. This document is the definitive implementation directive for that transition. It is not a proposal. It is not a list of options. It is the plan.

**The platform is built on four layers with clean, non-overlapping responsibilities:**

- **Next.js 14 (App Router)** — rendering, routing, SEO, and the customer-facing experience
- **Sanity** — editorial content, site configuration, SEO metadata, promotions, and all structured non-inventory content
- **Firebase / Firestore / Cloud Functions** — transactional operations, leads, forms, user accounts, manual listings, operational workflows, and email automation
- **HomeNet IOL + DriveEAI** — live inventory feed, the authoritative source for all vehicle records

The internal team will manage the site end-to-end: content updates, promotions, inventory corrections, lead handling, SEO changes, and site configuration. No code commits. No Firebase Console writes. No developer intervention for day-to-day operations.

Every architectural decision in this document exists to enforce that mandate while keeping the platform extensible for the full roadmap of features that will be activated beyond launch.

The existing `lib/inventory.ts`, `lib/homenet.ts`, `lib/driveai.ts`, `lib/types.ts`, Cloud Functions in `functions/index.js`, and Firestore security rules in `firestore.rules` remain in place as the foundation. This plan builds on them — it does not replace them unless a specific section explicitly directs otherwise.

---

## 2. Final Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER-FACING LAYER                         │
│                    Next.js 14 — App Router — Vercel                  │
│   SSG / ISR / SSR   ·   SEO metadata   ·   JSON-LD   ·   Sitemap    │
└────────────┬──────────────┬────────────────┬────────────────────────┘
             │              │                │
    ┌────────▼──────┐  ┌────▼──────┐  ┌─────▼──────────────────────┐
    │    SANITY     │  │ FIRESTORE │  │  HOMENET IOL + DRIVEAI     │
    │  Editorial    │  │ Operations│  │  Live Inventory Feed        │
    │  & Content    │  │ & Leads   │  │  VINs / Pricing / Media     │
    └───────────────┘  └────┬──────┘  └────────────────────────────┘
                            │
                   ┌────────▼──────────┐
                   │  CLOUD FUNCTIONS  │
                   │  Brevo Email      │
                   │  Price Alerts     │
                   │  Lead Triggers    │
                   │  ISR Revalidation │
                   └───────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         INTERNAL LAYER                               │
│   /admin/* (Next.js protected routes — Firebase Auth + role claims)  │
│   Leads · Finance · Reservations · Sell Requests · Manual Inventory  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        EDITORIAL LAYER                               │
│   Sanity Studio (hosted) — editorial, promotions, SEO, site config   │
│   Marketing role + Owner role — no developer required                │
└──────────────────────────────────────────────────────────────────────┘
```

### Layer responsibilities — non-negotiable boundaries

| Layer | Owns | Does NOT own |
|---|---|---|
| **HomeNet IOL / DriveEAI** | Vehicle records, pricing, photos, specs, feed status | Editorial copy, promotional pricing, site banners |
| **Sanity** | Homepage content, page copy, banners, blog, FAQs, promotions, SEO metadata, navigation, footer, site settings, trust badges, testimonials | Vehicle records, leads, user data, transactional state |
| **Firestore** | Leads, contacts, sell requests, finance applications, reservations, price alerts, saved vehicles, manual listings, user profiles, staff notes | Editorial content, feed inventory |
| **Cloud Functions** | Email triggers, price-drop alerts, ISR revalidation calls, operational automations | Rendering, routing, CMS content |
| **Next.js** | Rendering, routing, SEO tags, JSON-LD, ISR, sitemap generation | Data persistence, transactional logic, CMS content storage |

---

## 3. Why Sanity is the Correct Choice for Planet Motors

This section is a directive, not a comparison. Sanity has been selected. The reasoning is documented here for team alignment and future reference.

### The specific fit

Planet Motors' content problem is not a database problem. The team needs to manage structured editorial content — homepage heroes, promotional banners, blog posts, FAQ entries, trust signals, page copy, SEO metadata — without writing code. That is a CMS problem. Sanity is a CMS.

The inventory problem is already solved. `lib/inventory.ts` merges HomeNet IOL and DriveEAI with a clean VIN-deduplication strategy. DriveEAI wins on duplicate VINs because it carries richer AI-enriched data. That merge logic stays exactly as written. Sanity never touches inventory records.

### Why not Directus

Directus is a database-management layer. Its primary value is wrapping a Postgres schema in a REST/GraphQL API. Planet Motors does not need a third relational database. Firestore already owns the operational record. HomeNet and DriveEAI own the inventory record. Adding Directus creates a fourth data layer with no clear owner, requires a DBA to maintain schema migrations, and produces a confusing editing experience for non-technical staff — the opposite of the in-house management mandate.

### The technical case for Sanity at Planet Motors specifically

| Requirement | Sanity's answer |
|---|---|
| Non-technical staff edit content without code deploys | Sanity Studio is a polished, purpose-built editorial UI. Staff learn it in a day. |
| Next.js 14 App Router integration | `next-sanity` provides typed GROQ queries, on-demand ISR via `revalidateTag`, and App Router streaming. Already matches the pattern in `lib/homenet.ts`. |
| Homepage hero, banners, and promotions need draft/publish workflow | Sanity's document-level draft/publish pipeline with revision history is production-grade out of the box. |
| Editorial images need CDN delivery and responsive sizing | Sanity Image CDN + `@sanity/image-url` + `next/image` remote pattern = one-line config addition to `next.config.js`. |
| Structured, reusable page sections (not loose rich text) | Sanity's Portable Text + block-based schema supports the multi-section, reusable-CTA architecture required. |
| No infrastructure to maintain | Sanity is fully managed. No Postgres, no migrations, no indexes, no uptime responsibility. |
| SEO fields on every content type | Sanity schema objects for `seoMeta` are composable and reusable across every document type. |
| Future blog, landing pages, promo campaigns | Sanity's document model extends cleanly with new schemas — no re-architecture. |

### The hardcoded problem this solves today

The following values are currently hardcoded in `lib/types.ts` and `app/page.tsx`:

```typescript
// lib/types.ts — hardcoded dealer info
export const DEALER: DealerInfo = {
  name: 'Planet Motors',
  address: '30 Major Mackenzie Dr E',
  phone: '+14169852277',
  // ...
};

// app/page.tsx — hardcoded ratings
aggregateRating: { ratingValue: '4.9', reviewCount: '274' }
```

Every one of these values moves to Sanity `siteSettings`. The internal team updates phone numbers, hours, ratings, and addresses through Studio — not through a code commit.

---

## 4. CMS Scope

Sanity is the content source of truth for every editorial surface. The scope is defined here in full. No editorial surface is excluded from this scope.

### Pages with full Sanity content management

| Page / Route | Existing Route | Sanity Document Type | Management Level |
|---|---|---|---|
| Homepage | `app/page.tsx` | `homePage` | Full — hero, sections, CTA, spotlight config |
| About | `app/about/` | `aboutPage` | Full — copy, team, values, trust |
| Finance | `app/finance/` | `financePage` | Full — headline, body, calculator defaults, CTA |
| Sell / Trade-In | `app/sell/` | `sellPage` | Full — copy, form intro, appraisal expectations |
| Contact | `app/contact/` | `contactPage` | Full — copy, hours display, map config |
| FAQ | `app/faq/` | `faqEntry` (list) | Full — question/answer pairs, category grouping |
| Blog | `app/blog/` | `blogPost`, `blogCategory` | Full — authored posts, categories, author profiles |
| Protection / Warranty | `app/protection/` | `protectionPage` | Full — product descriptions, pricing tables, CTAs |
| Promotions | `/promotions/` (new) | `promotion` | Full — title, body, dates, CTA, target inventory filter |
| Landing pages | `/lp/[slug]/` (new) | `landingPage` | Full — multi-section builder |
| City / SEO pages | `/cars/[city]/` (new) | `seoPage` | Full — city-specific copy, inventory filter config |

### Site-wide Sanity content

| Content Type | Schema | Purpose |
|---|---|---|
| Site settings | `siteSettings` | Dealer identity, contact, hours, SEO defaults, social links, financing defaults, delivery settings, ratings display |
| Navigation | `navigation` | Primary nav, mobile nav, utility links |
| Footer | `footerConfig` | Footer columns, legal links, social icons |
| Global banners | `siteBanner` | Site-wide alert strips with start/end dates |
| Reusable CTA blocks | `ctaBlock` | Button + headline + body — referenced across pages |
| Testimonials | `testimonial` | Customer quote, name, vehicle, rating, date |
| Trust badges | `trustBadge` | Icon, label, tooltip — reusable across pages |
| Review display | `reviewSettings` (in `siteSettings`) | Aggregate rating, review count, source platform |
| OG / social images | Per-document `seoMeta` object | OG title, OG description, OG image, Twitter card |

### Block-based page architecture

Every page type uses a `pageBuilder` array of reusable section blocks. Supported block types at launch:

```
heroSection         — headline, subheadline, CTA(s), background image
textSection         — rich text (Portable Text), optional sidebar
inventorySpotlight  — filter config (make/model/fuel/body), heading, CTA
ctaSection          — full-width CTA with background color/image
testimonialSection  — display N testimonials from testimonial collection
trustSection        — display selected trust badges with layout options
faqSection          — embed FAQ entries by category
promoCard           — link to a promotion with thumbnail and excerpt
imageGallery        — editorial photo grid
videoEmbed          — YouTube/Vimeo embed with poster image
formEmbed           — reference a specific form type (contact, sell, etc.)
spacer              — configurable vertical spacing
```

This block library is defined once. Every page type that uses `pageBuilder` inherits all blocks. Adding a new block type is additive — no existing schemas change.

### Editorial workflow

- All Sanity documents support draft/publish workflow
- Marketing editors can draft and preview
- Owner can publish without approval gate (configurable)
- Marketing can be configured to require Owner approval before publish on sensitive document types (e.g., promotions with pricing, siteSettings changes)
- Revision history retained on all documents — full rollback via Studio UI
- Preview mode: Next.js draft mode enabled via Sanity preview secret — editors see unpublished changes on the live site URL before publishing

---

## 5. Inventory / Feed Scope

### Feed architecture — no changes to the merge strategy

The existing merge logic in `lib/inventory.ts` is correct and stays:

```
HomeNet IOL → DriveEAI → Manual (Firestore) → Fallback (empty)
DriveEAI wins on duplicate VINs.
Manual listings take precedence over both feeds for matching VINs.
```

The hardcoded `FALLBACK_INVENTORY` array in `lib/inventory.ts` is replaced with a Firestore query against `manual_listings`. When both feeds are offline, manual Firestore listings serve as the operational fallback. The hardcoded array is removed.

### HomeNet IOL integration

- `lib/homenet.ts` remains unchanged in interface contract
- ENV: `HOMENET_DEALER_ID`, `HOMENET_API_KEY`, `HOMENET_FEED_URL`
- Feed data maps to the `Vehicle` TypeScript interface already defined in `lib/types.ts`
- `source: 'homenet'` on all records from this feed
- Missing fields degrade gracefully — no field is required to render SRP cards (price shown as "Contact for Price" if absent, images fall back to placeholder)
- Cache TTL: 300s production / 60s development (existing `CACHE_TTL` logic retained)

### DriveEAI integration

- `lib/driveai.ts` remains unchanged in interface contract
- ENV: `DRIVEAI_DEALER_ID`, `DRIVEAI_API_KEY`, `DRIVEAI_API_URL`
- DriveEAI-specific fields surfaced in the `Vehicle` type:
  - `ai_insights.demand_score` — surfaced as "High Demand" badge on SRP/VDP when score ≥ 80
  - `ai_insights.price_position` — surfaced as "Below Market Value" badge when `below_market`
  - `ai_insights.days_on_market_avg` — used internally for staff dashboard sorting
- `source: 'driveai'` on all records from this feed

### 360 Media readiness

DriveEAI provides 360 image sets. The `Vehicle` and `VehicleImage` types are extended now — not later — to carry this data:

```typescript
// Extension to VehicleImage (lib/types.ts)
export interface VehicleImage {
  url:      string;
  alt:      string;
  width?:   number;
  height?:  number;
  view?:    'exterior' | 'interior' | 'detail';
  sequence?: number;
  // 360 / immersive media fields — activated when mediaType = '360'
  mediaType?: 'standard' | '360' | 'video';
  threeSixtyFrames?: string[];   // ordered array of frame URLs for spin viewer
  threeSixtyProvider?: 'driveai' | 'evox' | 'custom';
  hotspots?: {                   // future interactive hotspot support
    id: string;
    frameIndex: number;
    x: number;
    y: number;
    label: string;
    description?: string;
  }[];
}

// Extension to Vehicle (lib/types.ts)
export interface Vehicle {
  // ... existing fields ...
  mediaProfile?: 'standard' | 'mixed' | '360-only';
  // standard = photos only
  // mixed = standard photos + 360 set
  // 360-only = 360 frames are the primary media
}
```

**VDP rendering logic:**

```
if mediaProfile === '360-only' or '360 frames present':
  → render SpinViewer component (CSS/JS frame-scrubbing viewer)
  → fallback: display first frame as static image if JS disabled
if mediaProfile === 'mixed':
  → render standard gallery + 360 tab toggle
  → 360 tab lazy-loaded on click
if mediaProfile === 'standard' or no 360 data:
  → render existing image gallery (unchanged)
if no images at all:
  → render branded placeholder image
```

The `SpinViewer` component is stubbed at build time (renders placeholder with "360° View Coming Soon" label). It activates when `threeSixtyFrames` is populated. No VDP layout changes are required when 360 activates.

### SRP / VDP compatibility

- All filtering in `getFilteredInventory()` operates on the merged feed — no changes to filter logic
- VDP slug strategy (`buildVdpPath`) remains unchanged: `/inventory/used/[make]/[model]/[year]-[make]-[model]-[stock]/`
- Missing `trim` values render as empty string (already handled in `buildVdpPath`)
- Missing `price` renders as "Contact for Price" with a CTA button to the contact form
- Missing `images` array renders a placeholder image — no broken img tags
- `soldAt` + `getSoldPhase()` logic retained exactly — sold vehicles cycle through display phases as currently designed

### Feed reliability safeguards

- Both feed fetches wrapped in `Promise.allSettled()` — one feed failure does not block the other (already implemented)
- If both feeds return empty and no Firestore manual listings exist, a zero-vehicle SRP renders with a "Check back soon" message — no error thrown
- Feed errors logged server-side with structured log entries (`[HomeNet] error:`, `[DriveAI] error:`) — no PII in logs
- Next.js `fetch` cache with `revalidate: 300` prevents hammering feed APIs on high-traffic pages

---

## 6. Admin / Operations Scope

The admin layer is a protected Next.js application at `/admin/*`. It is secured by Firebase Auth with role-based custom claims. It is the operational dashboard for every staff function that does not belong in Sanity Studio.

### Admin sections

| Section | Route | Primary Users | Key Functions |
|---|---|---|---|
| Leads | `/admin/leads` | Sales Manager, Salesperson | View, filter, assign, note, status-update all contact/test-drive leads |
| Finance Applications | `/admin/finance` | Finance Manager, Owner | View pre-qual submissions, status updates, assign to F&I rep, export |
| Reservations | `/admin/reservations` | Sales Manager | View active reservations, confirm deposit receipt, mark fulfilled |
| Sell / Trade-In Requests | `/admin/sell-requests` | Sales Manager, Salesperson | View appraisal requests, assign, add offer notes, mark resolved |
| Manual Inventory | `/admin/inventory` | Sales Manager, Salesperson | Create/edit manual listings, mark sold, price-change flag, photo upload |
| Price Change Approvals | `/admin/inventory/approvals` | Sales Manager | Review pending price changes flagged by salespeople |
| Users / Staff | `/admin/users` | Owner | Assign Firebase custom claims by UID, view role assignments |
| Site Settings (mirror) | `/admin/settings` | Owner | Read-only mirror of key Sanity `siteSettings` values with link to Studio |
| Notifications Log | `/admin/notifications` | Owner | View sent Brevo email log, alert delivery status |

### Lead management detail

Each lead record in Firestore `leads` collection carries:

```
id, createdAt, updatedAt
source: 'contact-form' | 'test-drive' | 'vdp-inquiry' | 'finance-form' | 'price-alert'
status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted'
assignedTo: staffUid | null
priority: 'high' | 'normal' | 'low'
vehicleRef: stockNumber | null
customerName, customerEmail, customerPhone
notes: [{ authorUid, authorName, text, createdAt }]
flags: string[]  // e.g. ['trade-in', 'financing', 'urgent']
```

Admin UI supports: list view with filters (status, date range, assignee), detail view, inline note add, status change, assignment dropdown. All writes go through a server action that re-verifies the Firebase ID token — no client-side trust.

### Sell / trade-in request detail

Firestore `sellRequests` collection carries:

```
id, createdAt, updatedAt
status: 'new' | 'reviewing' | 'offer-sent' | 'accepted' | 'declined' | 'expired'
assignedTo: staffUid | null
vehicle: { year, make, model, trim, km, condition, vin? }
customerName, customerEmail, customerPhone
customerNotes, photos: string[]
staffOffer?: number
staffNotes: [{ authorUid, authorName, text, createdAt }]
```

### Manual listing operations

Firestore `manual_listings` collection mirrors the `Vehicle` TypeScript interface. Additional operational fields:

```
createdBy: staffUid
lastEditedBy: staffUid
pendingPriceChange?: { value: number, requestedBy: staffUid, requestedAt: timestamp }
photoUploadStatus: 'pending' | 'complete' | 'failed'
internalNotes: string
visibleOnSrp: boolean  // allows soft-hide without deleting
```

Photo upload: Firebase Storage at `gs://planetmotors/manual-listings/{stockNumber}/{filename}`. Upload handled client-side via Firebase SDK with a server-generated signed URL — Storage security rules reject direct client writes without the signed token.

### Notification / email automation (Cloud Functions — existing + extensions)

Existing Cloud Functions in `functions/index.js` are retained:

1. `onVehiclePriceUpdate` — price drop alert to subscribed users (existing)
2. `onContactCreate` — staff notification email (existing)
3. `onSellRequestCreate` — staff notification email (existing)
4. `onReservationCreate` — customer confirmation email (existing)

New Cloud Functions added in Phase A:

5. `onLeadCreate` — fires on new `leads` document; sends Brevo notification to assigned staff or staff group email
6. `onManualListingWrite` — fires on `manual_listings` write; calls Next.js `revalidateTag('inventory')` to trigger ISR refresh
7. `onFinanceApplicationCreate` — fires on new `financeApplications` document; sends notification to Finance Manager

---

## 7. Full Schema List

### Sanity schemas

#### Site-wide

```
siteSettings (singleton)
  dealerName, legalName, omvicNumber
  address { street, city, province, postalCode }
  phone, email, fax?
  coordinates { lat, lng }
  hours [{ day, open, close, closed }]
  socialLinks { facebook, instagram, twitter, youtube, tiktok, google }
  defaultSeo { title, description, ogImage }
  reviewDisplay { platform, rating, reviewCount, linkUrl }
  financingDefaults { defaultRate, defaultTermMonths, defaultDownPayment }
  deliverySettings { enabled, freeDeliveryRadiusKm, pricePerKmBeyond, maxRadiusKm }
  trustBadgeSet → reference[trustBadge]
  legalReferences { omvicLink, privacyPolicyText, termsText }

navigation (singleton)
  primaryLinks [{ label, href, children [{ label, href }] }]
  ctaButton { label, href }
  mobileLinks [{ label, href }]
  utilityLinks [{ label, href }]

footerConfig (singleton)
  columns [{ heading, links [{ label, href }] }]
  legalText
  copyrightLine
  socialLinks → siteSettings.socialLinks (reference)
  certificationBadges [{ image, alt, href? }]
```

#### Content pages

```
homePage (singleton)
  seoMeta { title, description, ogImage }
  pageBuilder [heroSection | textSection | inventorySpotlight | ctaSection |
               testimonialSection | trustSection | promoCard | imageGallery |
               videoEmbed | formEmbed | spacer]

aboutPage (singleton)
  seoMeta
  pageBuilder

financePage (singleton)
  seoMeta
  pageBuilder
  calculatorConfig { defaultRate, defaultTerm, defaultDown, disclaimer }

sellPage (singleton)
  seoMeta
  pageBuilder

contactPage (singleton)
  seoMeta
  pageBuilder
  mapConfig { embedUrl, zoomLevel }

protectionPage (singleton)
  seoMeta
  pageBuilder
  products [{ name, description, priceLabel, features [string], ctaLabel, ctaHref, highlighted }]

faqEntry (document)
  question
  answerPortableText
  category: string  // 'buying' | 'financing' | 'delivery' | 'ev' | 'protection' | 'general'
  order: number
  publishedAt
  seoMeta?

blogPost (document)
  title, slug
  author → staffAuthor
  category → blogCategory
  publishedAt, updatedAt
  excerpt
  heroImage { asset, alt, caption }
  bodyPortableText
  seoMeta { title, description, ogImage }
  tags [string]
  relatedPosts → [blogPost]
  featured: boolean

blogCategory (document)
  title, slug
  description
  color

staffAuthor (document)
  name, slug
  role
  bio
  avatar { asset, alt }

promotion (document)
  title, slug
  headline, subheadline
  bodyPortableText
  heroImage { asset, alt }
  ctaButton { label, href }
  startDate, endDate
  active: boolean
  inventoryFilter { make?, model?, fuel?, body?, tag? }
  seoMeta
  displayOnHomepage: boolean
  featuredOnSrp: boolean

landingPage (document)
  title, slug
  pageBuilder
  seoMeta
  campaignTag  // for UTM tracking alignment
  active: boolean
  expiresAt?

seoPage (document)
  title, slug
  city, province
  pageBuilder
  seoMeta
  inventoryFilter { make?, model?, fuel? }
  schema_cityName, schema_regionName

siteBanner (document)
  text, linkLabel?, linkHref?
  style: 'info' | 'promo' | 'warning' | 'urgent'
  startDate, endDate
  targetPages: 'all' | 'homepage' | 'srp' | 'vdp' | string[]
  active: boolean
  dismissible: boolean
```

#### Reusable objects / blocks

```
seoMeta (object)
  title, description
  ogImage { asset, alt }
  canonicalUrl?
  noIndex: boolean

heroSection (object)
  headline, subheadline
  backgroundImage { asset, alt }
  backgroundVideo?
  ctaButtons [ctaBlock]
  overlayOpacity: number
  textAlign: 'left' | 'center'

textSection (object)
  heading?
  bodyPortableText
  layout: 'full' | 'two-column'
  sidebarContent?

inventorySpotlight (object)
  heading, subheading
  filter { make?, model?, fuel?, body?, featured?, maxCount }
  ctaButton?
  layout: 'grid' | 'carousel'

ctaSection (object)
  heading, subheading
  ctaButtons [ctaBlock]
  backgroundStyle: 'dark' | 'light' | 'brand' | 'image'
  backgroundImage?

testimonialSection (object)
  heading
  testimonials → [testimonial]  // or 'auto-select-N'
  layout: 'carousel' | 'grid'

trustSection (object)
  heading?
  badges → [trustBadge]
  layout: 'horizontal' | 'grid'

faqSection (object)
  heading
  category?: string  // filter by category
  maxCount?

promoCard (object)
  promotion → promotion  // reference
  style: 'card' | 'banner' | 'hero'

imageGallery (object)
  heading?
  images [{ asset, alt, caption? }]
  columns: 2 | 3 | 4

videoEmbed (object)
  heading?
  url  // YouTube or Vimeo
  posterImage?
  caption?

formEmbed (object)
  formType: 'contact' | 'sell' | 'finance' | 'test-drive' | 'newsletter'
  heading?
  introText?

spacer (object)
  size: 'small' | 'medium' | 'large'

ctaBlock (object)
  label
  href
  style: 'primary' | 'secondary' | 'ghost' | 'link'
  openInNewTab: boolean

testimonial (document)
  customerName
  customerInitial  // for display if full name not appropriate
  vehiclePurchased?
  rating: 1 | 2 | 3 | 4 | 5
  text
  platform: 'google' | 'facebook' | 'direct'
  date
  featured: boolean
  approved: boolean  // moderation flag

trustBadge (document)
  label
  icon { asset, alt }
  tooltip?
  href?
  category: 'guarantee' | 'certification' | 'payment' | 'security' | 'partner'
```

### Firestore collections

```
leads/
  {leadId}: LeadRecord

contacts/
  {docId}: ContactSubmission  (existing)

sellRequests/
  {docId}: SellRequestRecord  (existing — extended with staff fields)

financeApplications/
  {docId}: FinanceApplication  (new — currently called 'leads', split by type)

reservations/
  {docId}: ReservationRecord  (existing)

savedVehicles/
  {docId}: SavedVehicle  (existing)

priceAlerts/
  {docId}: PriceAlert  (existing)

manual_listings/
  {stockNumber}: Vehicle + OperationalFields

users/
  {uid}: UserProfile  (existing)

staff/
  {uid}: StaffProfile { displayName, role, email, active, createdAt }

notification_log/
  {docId}: { type, recipient, subject, sentAt, status, relatedDocId }
```

---

## 8. Roles and Permissions Model

### Role definitions

| Role | Firebase Claim | Description |
|---|---|---|
| `owner` | `role: 'owner'` | Full access to everything — Sanity Studio, all admin sections, user management, raw Firestore via admin UI |
| `sales_manager` | `role: 'sales_manager'` | Full inventory admin, lead management, sell request management, read-only finance ledger, read-only Sanity banners/promos |
| `salesperson` | `role: 'salesperson'` | Own manual listings only (create, photo upload, sold marking), own leads only, cannot edit price without approval flag |
| `finance_manager` | `role: 'finance_manager'` | Full finance application access, deal documents, read-only inventory counts |
| `marketing` | `role: 'marketing'` | Full Sanity Studio editorial access (all content schemas), read-only admin inventory counts and sold stats |
| `customer` | `role: 'customer'` or unauthenticated | Saved vehicles, price alerts, form submissions, VDP/SRP browsing |

### Admin UI access matrix

| Section | Owner | Sales Manager | Salesperson | Finance Manager | Marketing |
|---|---|---|---|---|---|
| `/admin/leads` | Full | Full | Own only | None | None |
| `/admin/finance` | Full | Read only | None | Full | None |
| `/admin/reservations` | Full | Full | Read only | None | None |
| `/admin/sell-requests` | Full | Full | Own only | None | None |
| `/admin/inventory` | Full | Full | Own only | None | None |
| `/admin/inventory/approvals` | Full | Full | None | None | None |
| `/admin/users` | Full | None | None | None | None |
| `/admin/settings` | Full | Read only | None | None | None |
| `/admin/notifications` | Full | None | None | None | None |

### Sanity Studio access matrix

| Schema Type | Owner | Sales Manager | Finance Manager | Marketing |
|---|---|---|---|---|
| `siteSettings`, `navigation`, `footerConfig` | Full | None | None | None |
| `homePage`, `aboutPage`, `contactPage`, `financePage`, `sellPage`, `protectionPage` | Full | None | None | Full |
| `blogPost`, `blogCategory`, `staffAuthor` | Full | None | None | Full |
| `promotion`, `siteBanner`, `landingPage`, `seoPage` | Full | Read only | None | Full |
| `faqEntry`, `testimonial`, `trustBadge` | Full | None | None | Full |

### Enforcement architecture

```
1. Next.js middleware (middleware.ts)
   - Intercepts all /admin/* requests
   - Verifies Firebase ID token (server-side via Firebase Admin SDK)
   - Reads custom claim 'role' from decoded token
   - Redirects to /sign-in/ if unauthenticated or insufficient role

2. Server Actions / API Route Handlers
   - Re-verify ID token on every mutation
   - Never trust client-passed role strings
   - Validate role claim against operation type before executing Firestore write

3. Firestore Security Rules
   - manual_listings: write restricted to owner, sales_manager, salesperson (own docs)
   - leads: write restricted to server (Cloud Functions, admin API routes only — clients write via server action)
   - financeApplications: write-only from server; read restricted to finance_manager, sales_manager, owner
   - staff: read/write owner only

4. Sanity Studio roles
   - Configured via Sanity project member roles
   - marketing members assigned 'Editor' role in Sanity
   - Owner assigned 'Administrator' in Sanity
   - No other roles have Sanity project access
```

### Price change approval flow

```
Salesperson flags price change on manual listing:
  → sets pendingPriceChange: { value, requestedBy, requestedAt }
  → sends notification to sales_manager

Sales Manager reviews in /admin/inventory/approvals:
  → Approve: commits new price, clears pendingPriceChange, logs in internalNotes
  → Reject: clears flag, logs rejection reason in internalNotes, notifies salesperson
```

---

## 9. Source-of-Truth Matrix

| Data Point | Source of Truth | Secondary | Notes |
|---|---|---|---|
| Vehicle VIN, make, model, year, trim | HomeNet IOL / DriveEAI | — | Never edited in Sanity or admin UI |
| Vehicle price | HomeNet IOL / DriveEAI | Manual listing (Firestore) | Manual listing price overrides feed for matching VIN |
| Vehicle photos (standard) | HomeNet IOL / DriveEAI | Firebase Storage (manual listings) | Feed photos take precedence; manual listings use Firebase Storage |
| Vehicle 360 media | DriveEAI | — | Stored in `threeSixtyFrames` array on Vehicle record |
| Vehicle status (available/sold) | HomeNet IOL / DriveEAI | Manual listing (Firestore) | Feed status is authoritative; manual listings can be soft-hidden |
| Vehicle description / badges | DriveEAI (AI-generated) | Manual listing Firestore field | Staff can add to manual listings; feed descriptions are not edited |
| AI demand score / market position | DriveEAI | — | Read-only on VDP; staff cannot edit |
| Dealer identity, contact info, hours | Sanity `siteSettings` | — | Was hardcoded in `lib/types.ts` — migrated to Sanity |
| Aggregate ratings / review count | Sanity `siteSettings` | — | Was hardcoded in `app/page.tsx` — migrated to Sanity |
| Homepage hero content | Sanity `homePage` | — | |
| All page copy | Sanity (per page document type) | — | |
| Navigation / footer | Sanity `navigation`, `footerConfig` | — | |
| Blog posts | Sanity `blogPost` | — | |
| Promotions | Sanity `promotion` | — | |
| Site banners | Sanity `siteBanner` | — | |
| SEO metadata (editorial pages) | Sanity `seoMeta` per document | — | |
| SEO metadata (VDP / SRP) | Next.js `lib/seo.ts` generators | — | Generated from feed data — not CMS managed |
| JSON-LD (dealer) | Sanity `siteSettings` → `lib/seo.ts` | — | Rating/review fields sourced from Sanity |
| JSON-LD (vehicle) | Feed data → `lib/seo.ts` | — | |
| Leads / contacts | Firestore `leads`, `contacts` | — | |
| Finance applications | Firestore `financeApplications` | — | |
| Reservations | Firestore `reservations` | — | |
| Sell / trade-in requests | Firestore `sellRequests` | — | |
| Saved vehicles | Firestore `savedVehicles` | — | |
| Price alerts | Firestore `priceAlerts` | — | |
| User accounts | Firebase Auth | Firestore `users` | |
| Staff roles | Firebase Auth custom claims | Firestore `staff` | Custom claims are authoritative |
| Manual inventory listings | Firestore `manual_listings` | — | |
| Email delivery log | Firestore `notification_log` | — | Populated by Cloud Functions |
| Sitemap data | Next.js `sitemap.ts` | — | Generated from feed + Sanity slugs at build/revalidation |

---

## 10. Migration Phases

### Phase 0 — Foundation (pre-work, no user-facing changes)

**Duration target: 1 week**

- [ ] Provision Sanity project (Growth plan — free tier will hit API limits under production traffic)
- [ ] Add `next-sanity`, `@sanity/image-url`, `@sanity/client` to `next-app/package.json`
- [ ] Create `lib/sanity.ts` — typed GROQ client, `sanityFetch()` helper mirroring `lib/homenet.ts` pattern
- [ ] Add `cdn.sanity.io` to `next.config.js` `images.remotePatterns`
- [ ] Define `siteSettings` singleton schema in Sanity — populate with all hardcoded values from `lib/types.ts` and `app/page.tsx`
- [ ] Define `navigation` and `footerConfig` singleton schemas
- [ ] Install Sanity webhook → Next.js `/api/revalidate` endpoint (secret-authenticated)
- [ ] Set up Sanity project member roles: Owner = Administrator, Marketing = Editor
- [ ] Create `middleware.ts` in Next.js — Firebase Auth token verification for `/admin/*` routes
- [ ] Create Firestore `staff` collection and `manual_listings` collection
- [ ] Add Firestore security rules for `manual_listings` and `staff` collections
- [ ] Create Firestore indexes for `leads` (status + createdAt), `manual_listings` (status + visibleOnSrp)

**Exit gate:** `siteSettings` in Sanity is the live source for dealer name, phone, address, hours, and aggregate ratings. `lib/types.ts` `DEALER` constant and hardcoded ratings in `page.tsx` are removed. Site renders identically from Sanity data.

---

### Phase A — Core CMS + Admin Layer

**Duration target: 3 weeks**

#### A1 — Sanity editorial schemas + homepage migration

- [ ] Define all page document schemas: `homePage`, `aboutPage`, `financePage`, `sellPage`, `contactPage`, `protectionPage`, `faqEntry`
- [ ] Define all reusable block schemas: `heroSection`, `ctaSection`, `textSection`, `inventorySpotlight`, `testimonialSection`, `trustSection`, `ctaBlock`, `seoMeta`, `spacer`
- [ ] Define `testimonial`, `trustBadge` document schemas
- [ ] Populate all singleton pages with current site content in Sanity Studio
- [ ] Migrate `app/page.tsx` homepage to Next.js SSR pulling from Sanity `homePage` and `siteSettings`
- [ ] Migrate `app/about/`, `app/finance/`, `app/sell/`, `app/contact/`, `app/faq/`, `app/protection/` to pull from Sanity
- [ ] Implement block renderer component (`BlockRenderer.tsx`) — maps Sanity block type to React component
- [ ] Remove all hardcoded page copy — every user-facing string on these pages comes from Sanity

#### A2 — Manual inventory + admin layer

- [ ] Replace `FALLBACK_INVENTORY` in `lib/inventory.ts` with Firestore `getDocs(manual_listings)` query
- [ ] Build `/admin/inventory` — list, create, edit, sold marking, photo upload, soft-hide
- [ ] Build price-change approval flow — flag UI for salesperson, approval queue for sales manager
- [ ] Build `/admin/leads` — list with filters, detail view, note/status/assign
- [ ] Build `/admin/sell-requests` — list, detail, note/status/assign
- [ ] Build `/admin/reservations` — list, detail, confirm/fulfill
- [ ] Build `/admin/users` — Owner-only role assignment UI (sets Firebase custom claims via Admin SDK)
- [ ] Add Cloud Function `onManualListingWrite` → calls `revalidateTag('inventory')`
- [ ] Add Cloud Function `onLeadCreate` → Brevo notification to assigned staff
- [ ] Build `/admin/sign-in` — Firebase Auth email/password sign-in for staff

#### A3 — Legacy SPA removal

- [ ] Audit all legacy SPA entry points in `index.html`, `scripts.js`, `styles.css`
- [ ] Verify redirect coverage in `next.config.js` for every SPA URL with Search Console traffic
- [ ] Confirm no 404 regressions via Screaming Frog post-deploy crawl
- [ ] Remove `index.html`, `scripts.js`, `styles.css` from repo
- [ ] Remove legacy JS/CSS bundle references from `vercel.json`

**Exit gate:** Full site managed from Sanity + admin UI. Zero hardcoded business values in code. Zero SPA files served. All admin operations (lead review, manual inventory, role assignment) accessible via `/admin/*` without Firebase Console.

---

### Phase B — Extended Content + Operations

**Duration target: 3 weeks**

#### B1 — Blog

- [ ] Define `blogPost`, `blogCategory`, `staffAuthor` schemas
- [ ] Build `app/blog/` route: listing page (ISR), individual post pages (ISR + on-demand)
- [ ] Author attribution, category filtering, pagination
- [ ] OpenGraph + JSON-LD (`Article` schema) via `lib/seo.ts`
- [ ] Blog sitemap added to `sitemap-index.xml`

#### B2 — Promotions + banners

- [ ] Define `promotion`, `siteBanner` schemas
- [ ] Build `/promotions/` listing page and `/promotions/[slug]/` detail pages
- [ ] `siteBanner` global component in `app/layout.tsx` — date-gated, dismissible
- [ ] Promotions surfaced on homepage via `inventorySpotlight` block with `featuredOnSrp` flag
- [ ] Date-gating enforced in GROQ query — promotions with future `startDate` excluded

#### B3 — Admin finance application view + notifications log

- [ ] Build `/admin/finance` — application list, detail, status workflow
- [ ] Add Cloud Function `onFinanceApplicationCreate`
- [ ] Build `/admin/notifications` — delivery log from `notification_log` collection

#### B4 — reCAPTCHA hardening

- [ ] Integrate reCAPTCHA v3 on: contact form, sell form, finance form, price alert sign-up
- [ ] Server-side score verification in each API route (reject < 0.5 for standard, < 0.7 for finance)
- [ ] Graceful fallback: if reCAPTCHA unavailable, allow submission and flag in lead record

---

### Phase C — Advanced Content + SEO Expansion

**Duration target: Ongoing / as-needed**

#### C1 — Landing pages + SEO city pages

- [ ] Define `landingPage`, `seoPage` schemas
- [ ] Build `/lp/[slug]/` route with full `pageBuilder` block rendering
- [ ] Build `/cars/[city]/` route with city-specific copy + inventory filter
- [ ] City pages included in `sitemap-location.xml` (already exists in repo)

#### C2 — 360 media activation

- [ ] Implement `SpinViewer` React component (frame-scrubbing CSS/JS viewer)
- [ ] Wire to `threeSixtyFrames` array on `Vehicle` when DriveEAI provides frames
- [ ] VDP tab toggle: Photos | 360° View
- [ ] Lazy-load 360 frames on tab activation

#### C3 — Coming soon inventory + buyer-facing features

- [ ] Add `coming-soon` status to `manual_listings`
- [ ] SRP rendering: blurred hero card, "Notify Me" CTA → creates `priceAlerts` entry
- [ ] Buyer guide / comparison pages (new Sanity schema `buyerGuide`)

#### C4 — Reputation + review widgets

- [ ] Build `ReviewWidget` component pulling from `siteSettings.reviewDisplay`
- [ ] Google Business Profile review feed integration (if API access available)
- [ ] Testimonials carousel component (pulls from `testimonial` documents)

---

## 11. Acceptance Criteria by Phase

### Phase 0 Acceptance Criteria

- [ ] `siteSettings` singleton exists in Sanity and is the live data source for: dealer name, address, phone, email, hours, OMVIC number, aggregate rating, review count
- [ ] `DEALER` constant in `lib/types.ts` is removed; all references replaced with Sanity fetch
- [ ] Hardcoded `aggregateRating` in `app/page.tsx` and `app/layout.tsx` is removed; values come from Sanity
- [ ] Navigation and footer content served from Sanity `navigation` / `footerConfig`
- [ ] Sanity webhook triggers Next.js ISR revalidation within 5 minutes of a Studio publish
- [ ] `middleware.ts` blocks unauthenticated access to all `/admin/*` routes
- [ ] `manual_listings` and `staff` Firestore collections exist with correct security rules

### Phase A Acceptance Criteria

- [ ] Homepage hero copy editable via Sanity Studio — change visible on live site within 5 minutes of publish, no code deploy required
- [ ] All existing pages (about, finance, sell, contact, FAQ, protection) render content from Sanity
- [ ] A salesperson can create a manual listing in `/admin/inventory` and it appears on the live SRP within the 5-minute ISR window
- [ ] Owner can assign Firebase role to a staff UID in `/admin/users` — role takes effect on next sign-in
- [ ] A salesperson cannot edit price directly — price change flag goes to approval queue
- [ ] All new leads submitted via contact form appear in `/admin/leads` with correct status `new`
- [ ] Staff receive Brevo email notification within 60 seconds of new lead submission
- [ ] Zero SPA files served from `www.planetmotors.app`
- [ ] All legacy SPA URLs resolve with 301 redirects — no broken chains
- [ ] Homepage passes Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms at p75 on PageSpeed Insights

### Phase B Acceptance Criteria

- [ ] Marketing can publish a blog post in Sanity Studio — post appears on `www.planetmotors.app/blog/` without developer intervention
- [ ] A `siteBanner` with start/end dates shows on the live site during its active window and disappears after expiry — no code change required
- [ ] A promotion with `featuredOnSrp: true` and a future `startDate` is NOT visible on SRP until `startDate` passes
- [ ] Finance Manager can view all finance applications in `/admin/finance` — no Firebase Console access required
- [ ] reCAPTCHA v3 server-side verification active on all form submissions — score < 0.5 rejects submission with user-visible error

### Phase C Acceptance Criteria

- [ ] A landing page created in Sanity `landingPage` is live at `/lp/[slug]/` within 5 minutes of publish
- [ ] 360 view activates on VDP when DriveEAI provides `threeSixtyFrames` — falls back to static gallery if frames absent
- [ ] A `coming-soon` manual listing appears on SRP with blurred hero and no price — "Notify Me" creates a `priceAlerts` entry in Firestore
- [ ] All Firestore-indexed queries return results in < 500ms under normal load

---

## 12. Risks, Controls, and Rollback Considerations

### Risk 1 — Sanity API outage causes content-dark pages

**Probability:** Low (Sanity SLA 99.9%)
**Impact:** High — homepage and all editorial pages render without content

**Controls:**
- Next.js ISR serves cached page content even when Sanity is unreachable (stale-while-revalidate)
- All `sanityFetch()` calls use `try/catch` with fallback to last cached response
- Critical fields (dealer phone, address) have environment variable fallbacks for emergency use

**Rollback:**
- If Sanity is unreachable > 15 minutes: redeploy last known-good Vercel build (1-click in Vercel dashboard)
- Emergency fallback: re-introduce `DEALER` constant in `lib/types.ts` as ENV-var-backed values

---

### Risk 2 — HomeNet or DriveEAI feed outage clears inventory from SRP

**Probability:** Medium (external API dependency)
**Impact:** High — SRP shows 0 vehicles

**Controls:**
- `Promise.allSettled()` means one feed failure does not block the other (already implemented)
- Firestore `manual_listings` serves as operational floor — key vehicles always available manually
- Feed failure logged with structured server logs — alerting can be wired to a monitoring service

**Rollback:**
- Add critical vehicles to `manual_listings` manually in `/admin/inventory`
- No code change required — admin UI handles this

---

### Risk 3 — Firebase Auth custom claims not propagating to staff after role change

**Probability:** Medium (Firebase platform behavior — claims require token refresh)
**Impact:** Medium — staff member cannot access newly granted section

**Controls:**
- `/admin/users` UI shows warning: "Role change takes effect on next sign-in"
- Staff sign out and sign back in — claim is refreshed
- Force-refresh option in admin UI: calls Firebase Admin SDK `revokeRefreshTokens(uid)` to invalidate all sessions

**Rollback:** N/A — role change is reversible via the same admin UI

---

### Risk 4 — Legacy SPA URL removal causes organic traffic 404s

**Probability:** Medium (if Search Console audit is skipped)
**Impact:** High — SEO damage, broken bookmarks

**Controls:**
- Phase A3 is explicitly gated on Search Console URL audit
- Screaming Frog crawl required before SPA files are removed
- `next.config.js` redirects are code-reviewed before deploy

**Rollback:**
- Git revert of SPA file removal commit restores files immediately
- Vercel instant rollback (previous deployment available for 90 days)

---

### Risk 5 — Sanity schema migration breaks existing content

**Probability:** Low-Medium (schema changes on live documents)
**Impact:** Medium — content fails to render

**Controls:**
- New schemas deployed as additive (new fields optional, never remove existing fields until migrated)
- Content migrations run in Sanity with `sanity-migrate` before schema deploy
- Staging Sanity dataset used for schema testing before production push

**Rollback:**
- Sanity datasets are snapshotable — export before any migration
- Revert Next.js GROQ queries to previous field names via git revert

---

### Risk 6 — Cloud Function cold starts delay ISR revalidation

**Probability:** Medium
**Impact:** Low — inventory appears stale for up to 60 additional seconds on cold start

**Controls:**
- Cloud Functions for ISR revalidation set to minimum instance = 1 (eliminates cold start)
- Alternative: admin API route in Next.js handles `revalidateTag` directly on Firestore write (no Cloud Function needed)

---

## 13. Future-Ready Capabilities Included from Day One

These capabilities are architected into schemas and types now. They do not require re-architecture when activated.

### Content / CMS capabilities (ready in schema — not yet publishing)

| Capability | Schema Ready | Activation Required |
|---|---|---|
| Blog publishing | `blogPost`, `blogCategory`, `staffAuthor` defined in Phase B | Build `app/blog/` route |
| Promo landing pages | `landingPage` with full `pageBuilder` | Build `/lp/[slug]/` route |
| Site-wide banners | `siteBanner` with date-gating | Add `SiteBanner` component to layout |
| Reusable CTA blocks | `ctaBlock` object type across all page builders | Already in every `pageBuilder` |
| Testimonials module | `testimonial` documents + `testimonialSection` block | Marketing populates documents |
| Trust badge module | `trustBadge` documents + `trustSection` block | Marketing populates documents |
| Multi-section landing pages | `pageBuilder` block array on all page types | Content entered in Studio |
| SEO city / service pages | `seoPage` schema with `inventoryFilter` config | Build `/cars/[city]/` route |
| EV education pages | `landingPage` schema supports any content structure | Create documents in Studio |
| Warranty / protection product pages | `protectionPage` schema with `products` array | Already in Phase A |
| Financing campaign pages | `landingPage` + `promotion` with `campaignTag` | Create documents in Studio |
| Seasonal sales pages | `promotion` with `startDate`/`endDate` | Create documents in Studio |
| Inventory promo sections | `inventorySpotlight` block + `promotion.inventoryFilter` | Already in `pageBuilder` |
| Review / reputation widgets | `siteSettings.reviewDisplay` + `testimonial` documents | Build `ReviewWidget` component |
| Buyer guide / comparison content | `buyerGuide` schema (Phase C) | Define schema, build route |

### Inventory / feed capabilities (ready in types — not yet activated)

| Capability | Type Ready | Activation Required |
|---|---|---|
| 360 image sets | `threeSixtyFrames`, `mediaProfile` on `VehicleImage`/`Vehicle` | Build `SpinViewer` component |
| Mixed standard + 360 media | `mediaProfile: 'mixed'` flag on `Vehicle` | VDP tab toggle component |
| Fallback image behavior | Already handled — missing images render placeholder | None |
| Interactive hotspots | `hotspots[]` on `VehicleImage` | Hotspot overlay component |
| Coming soon inventory | `manual_listings` `status` field supports new value | Add status value + SRP card variant |
| DriveEAI demand score badge | `ai_insights.demand_score` mapped on `Vehicle` | SRP/VDP badge component |
| DriveEAI price position badge | `ai_insights.price_position` on `Vehicle` | SRP/VDP badge component |

### Operations capabilities (ready in schema — not yet built)

| Capability | Schema Ready | Activation Required |
|---|---|---|
| Staff-specific routing / lead assignment | `leads.assignedTo` field exists | Assignment UI in admin |
| Approval workflow for inventory edits | `pendingPriceChange` on `manual_listings` | Approval queue in Phase A |
| Batch CSV import for manual listings | Firestore collection structure supports bulk write | Build CSV import UI |
| Notification delivery log | `notification_log` Firestore collection defined | Build `/admin/notifications` |

---

## 14. Final Handoff Model

### What the internal team owns and operates without developer involvement

| Function | Tool | Who |
|---|---|---|
| Update homepage copy, hero image, CTAs | Sanity Studio | Marketing |
| Update any page copy (about, finance, sell, contact, FAQ, protection) | Sanity Studio | Marketing |
| Publish a blog post | Sanity Studio | Marketing |
| Create / schedule a promotion | Sanity Studio | Marketing |
| Add or remove a site-wide banner | Sanity Studio | Marketing |
| Update dealer phone, hours, address | Sanity Studio `siteSettings` | Owner |
| Update aggregate rating / review count | Sanity Studio `siteSettings` | Owner |
| Update financing defaults | Sanity Studio `siteSettings` | Owner |
| Update navigation links | Sanity Studio `navigation` | Marketing / Owner |
| Add a manual vehicle listing | `/admin/inventory` | Salesperson / Sales Manager |
| Mark a vehicle sold | `/admin/inventory` | Salesperson |
| Request a price change | `/admin/inventory` | Salesperson |
| Approve a price change | `/admin/inventory/approvals` | Sales Manager |
| Review a new lead | `/admin/leads` | Sales Manager / Salesperson |
| Assign a lead to a staff member | `/admin/leads` | Sales Manager |
| Review a finance application | `/admin/finance` | Finance Manager |
| Review a sell / trade-in request | `/admin/sell-requests` | Sales Manager |
| Review a reservation | `/admin/reservations` | Sales Manager |
| Assign a staff role | `/admin/users` | Owner |

### What still requires developer involvement

| Function | Why | Priority |
|---|---|---|
| New page route (e.g. `/lp/[slug]/`) | Requires Next.js route file and block renderer wiring | Phase C — pre-built for landing pages |
| New Sanity schema field or document type | Schema changes require code deploy | Rare — schema is comprehensive at launch |
| New Cloud Function | Logic change requires function deploy | Rare |
| Firestore security rule changes | Rules require deploy | Rare |
| DNS / domain changes | Infrastructure | As needed |
| Vercel environment variable changes | Infrastructure | As needed |

### The goal state

On day one of full production:
- Marketing updates the homepage, publishes a blog post, and schedules a promotion — no ticket, no developer, no wait
- A salesperson adds a manual listing, uploads photos, and marks it sold — no Firebase Console, no developer
- Owner updates store hours at 8pm on a Sunday — Sanity Studio on any device, published live in under 5 minutes
- A lead comes in at midnight — Brevo email fires to staff automatically, lead appears in `/admin/leads` in the morning

That is the system this plan delivers.

---

*Planet Motors Production Platform Plan · Architect-approved for execution · 2026-03-16*
