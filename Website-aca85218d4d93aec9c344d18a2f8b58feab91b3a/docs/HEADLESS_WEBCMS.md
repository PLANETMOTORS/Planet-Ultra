# HEADLESS WEBCMS — Planet Motors
## Production-Grade Implementation Plan
**Version:** 2.0 | **Date:** 2026-03-16 | **Classification:** Internal Engineering — Owner Review

---

## 1. EXECUTIVE RECOMMENDATION

Planet Motors has a production-grade Next.js 14 inventory engine, a working Firebase/Firestore transactional layer, and four Cloud Functions that operate without issue. None of that changes.

The problem is contained and specific: all editorial content is locked inside `scripts.js` (2,740 lines of unmanageable vanilla JS), hardcoded in `lib/types.ts` and `lib/seo.ts`, or sitting raw in Firestore with no management interface. The internal team cannot touch any of it without a developer.

**The fix is additive, not a rebuild.**

This project is named **HEADLESS WEBCMS**. It implements Sanity.io as the structured content layer on top of the existing Next.js + Firebase foundation. It adds a role-based internal Admin Dashboard for lead and operations management. It migrates the legacy homepage SPA to proper React Server Components. It eliminates `scripts.js` entirely.

**Decision:**
- **CMS:** Sanity.io (Growth tier)
- **Admin Dashboard:** Next.js App Router `/admin/*` + Firebase Admin SDK
- **Frontend:** Next.js 14 App Router — unchanged
- **Inventory:** HomeNet IOL + DriveEAI — unchanged, extended for 360 media readiness
- **Transactional:** Firebase / Firestore / Cloud Functions — unchanged

After full implementation, the internal team manages the website A to Z — homepage, banners, FAQs, blog, promos, static pages, leads, reservations, business configuration — from a browser, with zero developer intervention for daily operations.

**The rule:** If a routine business change requires a code commit, the implementation has failed.

---

## 2. FINAL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HEADLESS WEBCMS                              │
│                     Planet Motors Platform                          │
├─────────────────┬────────────────────┬──────────────────────────────┤
│  CONTENT LAYER  │  INVENTORY LAYER   │   TRANSACTIONAL LAYER        │
│                 │                    │                              │
│  Sanity.io      │  HomeNet IOL       │  Firebase Auth               │
│  (CMS)          │  DriveEAI          │  Firestore (NoSQL)           │
│  10 schemas     │  360 media ready   │  Cloud Functions (Node 22)   │
│  Growth tier    │  VIN-merge logic   │  Firebase Storage            │
│  2 datasets     │  Fallback array    │  Brevo email (transactional) │
├─────────────────┴────────────────────┴──────────────────────────────┤
│                    RENDERING LAYER                                   │
│                                                                      │
│  Next.js 14 App Router (Vercel)                                      │
│  ├── /                    → Sanity homepage singleton (RSC)          │
│  ├── /inventory/used/**   → HomeNet IOL + DriveEAI (unchanged)       │
│  ├── /about, /finance, /sell, /contact, /faq → Sanity staticPage     │
│  ├── /protection/[slug]   → Sanity protectionPlan                    │
│  ├── /blog/[slug]         → Sanity blogPost                          │
│  ├── /promo/[slug]        → Sanity promoPage                         │
│  └── /admin/**            → Firebase Admin SDK (server-only)         │
├──────────────────────────────────────────────────────────────────────┤
│                    STAFF INTERFACES                                   │
│                                                                      │
│  studio.planetmotors.app  → Sanity Studio (editorial/content)        │
│  planetmotors.app/admin   → Next.js Admin Dashboard (ops/leads)      │
└──────────────────────────────────────────────────────────────────────┘
```

**Source-of-Truth separation is absolute:**
- HomeNet IOL / DriveEAI → inventory data
- Sanity → editorial, website, SEO, business configuration
- Firestore → transactional records, user data, operational workflows
- Cloud Functions → automation and email triggers
- Next.js → rendering only

---

## 3. WHY SANITY IS THE CORRECT CHOICE FOR PLANET MOTORS

### vs. Directus
Directus is a SQL database wrapper. Its primary value is auto-generating REST/GraphQL from a relational schema that the team owns and operates. Planet Motors does not own its inventory data model — HomeNet IOL and DriveEAI are the authoritative sources. Adding Directus as a third inventory layer creates sync debt with no clear owner. Directus also requires a separate Node.js server and PostgreSQL instance — two new infrastructure dependencies for a single-location dealership. It is the right tool for teams building internal data platforms. It is not the right tool for editorial website management.

### vs. Payload CMS v3
Payload v3 runs inside the Next.js app and is TypeScript-native. It is a strong runner-up for teams that want zero vendor lock-in and will manage their own PostgreSQL. It requires more setup time and infrastructure ownership than Sanity. Recommended if Planet Motors expands to multi-location and wants full self-hosting. Not the fastest path to in-house control today.

### Why Sanity wins for Planet Motors specifically
1. **Studio UI** is the most polished non-technical editor available. Staff open a URL, see their content, make changes, hit Publish. No Firestore console, no JSON, no developer.
2. **next-sanity v9** integrates natively with Next.js 14 App Router including React Server Components and Visual Editing live preview.
3. **GROQ** is more precise than REST for page-level content queries — fetch only what each component needs, fully typed.
4. **Portable Text** handles all structured rich content without HTML injection risk — safe for non-technical editors.
5. **Sanity Asset Pipeline** is a built-in CDN for editorial images — staff drag-and-drop images inside the editor, images are served as WebP automatically.
6. **Free to Growth** — The Growth plan ($99/month) supports 25 users, 2 datasets (production + staging), and sufficient API quota for a single dealership. No servers to manage.
7. **Webhook → Vercel ISR** — A staff member publishes a change and it is live within 60 seconds (target SLA). No deployment required.
8. **Schema is TypeScript** — Sanity schemas are defined in the same language as the Next.js codebase. Auto-generated types flow directly into components.

---

## 4. CMS SCOPE

Sanity manages all editorial, marketing, SEO, and business configuration content. It does not manage inventory records, transactional data, or operational workflows.

### Content domains owned by Sanity

| Domain | Current State | After HEADLESS WEBCMS |
|--------|--------------|----------------------|
| Homepage sections | `scripts.js` rendering functions | Sanity `homepage` singleton |
| Site-wide banners | None | Sanity `banner` collection |
| FAQ content | Hardcoded in `scripts.js` | Sanity `faqItem` collection |
| About, Finance, Sell, Contact pages | Hardcoded in `scripts.js` | Sanity `staticPage` collection |
| Protection plan pages | Hardcoded in `app/protection/*/page.tsx` | Sanity `protectionPlan` collection |
| Blog | Empty route | Sanity `blogPost` collection |
| Promo landing pages | None | Sanity `promoPage` collection |
| Testimonials | Hardcoded in `scripts.js` | Sanity `testimonial` collection |
| Trust badges | Hardcoded in `scripts.js` | Sanity `homepage.trustBadges` |
| Navigation items | Hardcoded component | Sanity `siteSettings.navigationItems` |
| Footer content | Hardcoded component | Sanity `siteSettings.footerContent` |
| Dealer identity | `lib/types.ts → DEALER` constant | Sanity `siteSettings` singleton |
| Business hours | `lib/types.ts → DEALER.hours` | Sanity `siteSettings.businessHours` |
| Financing defaults | `lib/utils.ts` lines 26–27 | Sanity `siteSettings.financingDefaults` |
| Delivery configuration | `app/api/distance/route.ts` hardcoded | Sanity `siteSettings.deliveryConfig` |
| Aggregate rating display | `app/layout.tsx` lines 60–63 | Sanity `siteSettings.ratingDisplay` |
| Default SEO metadata | `lib/seo.ts` STATIC_META | Sanity `siteSettings.defaultSeo` |
| Social links | Hardcoded in layout/footer | Sanity `siteSettings.socialLinks` |
| Lead routing rules | `STAFF_EMAIL` env var (single) | Sanity `siteSettings.leadRoutingRules` |

### Block-based page architecture

All rich content pages (`staticPage`, `protectionPlan`, `promoPage`, `blogPost`) use Sanity Portable Text with a defined block type registry:

**Standard blocks:** Paragraph, H2, H3, Blockquote, Bulleted list, Numbered list

**Custom blocks:**
- `calloutBlock` — style: info | warning | success | promo
- `imageBlock` — alignment: full | left | right | center, optional link
- `videoEmbedBlock` — YouTube or Vimeo (ID only, not full URL)
- `ctaBlock` — style: centered | left-aligned | banner
- `specTableBlock` — label/value rows (protection plans)
- `accordionBlock` — inline FAQ items within page body

**Not supported:** Raw HTML embed, form embed, map embed, carousel block, social feed embed.

---

## 5. INVENTORY / FEED SCOPE

### Feed architecture — unchanged

```
HomeNet IOL feed  ──┐
                    ├──► lib/inventory.ts (VIN-merge) ──► getInventory() ──► SRP / VDP
DriveEAI feed     ──┘
                    ↑
               DriveEAI wins on duplicate VINs (richer AI data + 360 media)
```

**Nothing in the inventory pipeline changes.** `lib/homenet.ts`, `lib/driveai.ts`, `lib/inventory.ts`, all VDP routes, all SRP routes — untouched.

### Manual listings (new — Phase A)

A `manualListing` Sanity schema allows staff to add vehicles not in HomeNet or DriveEAI (consignment, demo vehicles, private acquisitions). The inventory merger gains a third source:

```typescript
const [hn, da, manual] = await Promise.allSettled([
  fetchHomeNetInventory(),
  fetchDriveAiInventory(),
  fetchSanityManualListings(),  // NEW — published manualListing docs
])

// Merge priority: HomeNet base → DriveEAI overwrites on VIN → manual fills gaps only
// Manual listings appear only when their VIN is absent from both feeds
```

Manual listings map exactly to the `Vehicle` TypeScript interface in `lib/types.ts`. VDP routing, SRP filtering, and sitemap generation work automatically.

### 360 media readiness — architecture locked now

The `VehicleImage` interface is extended to support 360 media from day one. This does not activate any 360 UI features immediately but ensures no architecture rework is required when 360 features are enabled:

```typescript
export interface VehicleImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  view?: 'exterior' | 'interior' | 'detail' | '360-exterior' | '360-interior';
  sequence?: number;
  // 360 media fields — populated by DriveEAI when available
  mediaType?: 'standard' | '360' | 'video';
  spin360Url?: string;       // DriveEAI spin URL when mediaType === '360'
  spin360FrameCount?: number;
  spin360Provider?: string;  // 'driveai' | 'homenet' | 'manual'
}
```

The VDP image gallery component is built with a media type switcher from day one:
- Default: standard photo gallery (active immediately)
- 360 tab: enabled when `images.some(i => i.mediaType === '360')` — hidden otherwise
- No layout rework required to activate 360 when DriveEAI provides spin data

**Fallback behavior:** If `spin360Url` is absent or fails to load, the component falls back to the primary standard photo. Zero broken experience.

### Feed reliability safeguards — unchanged

The 8-vehicle `FALLBACK_INVENTORY` array in `lib/inventory.ts` remains as the last-resort fallback when both feeds are simultaneously offline. It is never shown under normal operation. Do not delete it.

---

## 6. ADMIN / OPERATIONS SCOPE

The Admin Dashboard is built as protected Next.js App Router routes at `/admin/*`. It is not a separate SPA, not a third-party platform, and not a Firestore console wrapper.

### Route structure

```
next-app/app/admin/
├── layout.tsx              ← Server component: Firebase JWT verify + role check
├── page.tsx                ← Overview: pending lead counts + recent 10 activity entries
├── leads/
│   ├── page.tsx            ← contacts collection — filterable, sortable
│   └── [id]/page.tsx       ← Full lead detail + status + notes + assignee
├── finance-leads/
│   ├── page.tsx            ← leads collection
│   └── [id]/page.tsx       ← Full finance application detail
├── reservations/
│   ├── page.tsx            ← reservations collection
│   └── [id]/page.tsx       ← Full reservation: vehicle + customer + trade-in + delivery + deposit
├── sell-requests/
│   ├── page.tsx            ← sellRequests collection
│   └── [id]/page.tsx       ← Full detail with Firebase Storage photo thumbnails
├── inventory/
│   ├── page.tsx            ← Manual listings management (Sanity manualListing docs)
│   └── [id]/page.tsx       ← Manual listing edit/status
├── price-alerts/
│   └── page.tsx            ← priceAlerts — read-only log
└── settings/
    └── staff/page.tsx      ← Role management (admin only)
```

### Auth flow

1. User signs in via existing Firebase Auth (unchanged)
2. `admin/layout.tsx` (Server Component) reads Firebase session cookie
3. Firebase Admin SDK verifies JWT server-side
4. Reads `users/{uid}.role` from Firestore
5. `role` not in `['admin', 'staff']` → `redirect('/')`
6. `admin` sees all records; `staff` sees only records where `assignedTo === uid`

### New fields added to Firestore lead collections

Added to `contacts`, `leads`, `reservations`, `sellRequests`:

```
status:        string   // 'new' | 'reviewed' | 'contacted' | 'closed' (default: 'new')
adminNotes:    string   // append-only — new notes prepended with ISO timestamp
assignedTo:    string   // Firebase UID or null
updatedAt:     timestamp
updatedBy:     string   // Firebase UID
updatedByName: string
```

Added to `users/{uid}`:
```
role: 'owner' | 'sales_manager' | 'salesperson' | 'finance_manager' | 'marketing_editor' | 'staff' | 'customer'
```

New Firestore document:
```
config/siteSettings   // Written by /api/sanity-sync on siteSettings publish
                      // Read by Cloud Functions at runtime
```

### Real-time unread badge

A single Client Component in `admin/layout.tsx` subscribes to Firestore real-time listeners on all four lead collections filtered to `status == 'new'`. Renders count badges on sidebar nav items. Unsubscribes on unmount.

### Audit trail

Every status update from the admin dashboard writes:
```typescript
{
  status: newStatus,
  updatedAt: serverTimestamp(),
  updatedBy: currentUser.uid,
  updatedByName: currentUser.displayName,
  adminNotes: prependedNote,
  assignedTo: assigneeUid,
}
```

---

## 7. FULL SCHEMA LIST

### Schema 1: `siteSettings` — Singleton

```typescript
{
  // Dealer Identity
  dealerName:                   string,        // 'Planet Motors'
  omvicNumber:                  string,        // '5482807'
  baseUrl:                      url,           // 'https://www.planetmotors.app'
  legalName:                    string,        // legal entity name
  foundedYear:                  number,

  // Contact
  phone:                        string,        // '+14169852277' E.164
  tollFreePhone:                 string,        // '1-866-797-3332'
  email:                        email,         // 'info@planetmotors.app'
  serviceEmail:                 email,

  // Address
  streetAddress:                string,        // '30 Major Mackenzie Dr E'
  city:                         string,        // 'Richmond Hill'
  province:                     string,        // 'ON'
  postalCode:                   string,        // 'L4C 1G7'
  country:                      string,        // 'CA'
  lat:                          number,        // 43.8758
  lng:                          number,        // -79.4378

  // Business Hours (7 entries)
  businessHours: [{
    day:          string,
    openTime:     string,
    closeTime:    string,
    isClosed:     boolean,
  }],

  // Financing Defaults
  financingDefaults: {
    defaultRate:         number,    // 7.0 — replaces utils.ts:26
    defaultTermMonths:   number,    // 72 — replaces utils.ts:27
    downPaymentLabel:    string,    // '$0 down' — replaces VDP hardcode
    depositAmount:       number,    // 250 — replaces functions/index.js:223
    depositIsRefundable: boolean,
    responseSLAText:     string,    // '1 business hour'
  },

  // Delivery Configuration
  deliveryConfig: {
    originPostalCode:    string,    // 'L4C 1G7'
    freeDeliveryUpToKm:  number,    // 300
    pricingTiers: [{
      fromKm:            number,
      toKm:              number,
      ratePerKm:         number,
    }],
  },

  // Sold Vehicle Policy
  soldVehicleRetentionDays:     number,        // 30

  // Rating Display
  ratingDisplay: {
    ratingValue:         number,    // 4.9 — replaces layout.tsx:60
    reviewCount:         number,    // 274 — replaces layout.tsx:63
    reviewsUrl:          url,
    ratingSource:        string,    // 'Google'
  },

  // Navigation
  navigationItems: [{
    label:               string,
    url:                 string,
    isVisible:           boolean,
    openInNewTab:        boolean,
    children: [{
      label:             string,
      url:               string,
      isVisible:         boolean,
    }],
  }],

  // Footer
  footerContent: {
    copyrightText:       string,
    disclaimerText:      text,
    columns: [{
      heading:           string,
      links: [{
        label:           string,
        url:             string,
      }],
    }],
  },

  // Social Links
  socialLinks: {
    googleMyBusiness:    url,
    instagram:           url,
    facebook:            url,
    twitter:             url,
    youtube:             url,
    linkedin:            url,
  },

  // Lead Routing
  leadRoutingRules: [{
    formType:            enum['contact', 'finance', 'sell', 'reservation'],
    recipientEmail:      email,
    recipientName:       string,
  }],

  // Default SEO
  defaultSeo: {
    metaTitle:           string,    // max 60 chars
    metaDescription:     text,      // max 160 chars
    ogImage:             image,     // 1200x630
    twitterHandle:       string,    // '@planetmotorsca'
  },

  // Trust & Legal
  trustBadges: [{
    image:               image,
    alt:                 string,
    linkUrl:             url,
  }],
  privacyPolicyUrl:             url,
  termsUrl:                     url,
  omvicBadgeUrl:                url,
}
```

### Schema 2: `homepage` — Singleton

```typescript
{
  // Hero Banner
  hero: {
    headline:            string,
    subheadline:         string,
    ctaText:             string,
    ctaUrl:              string,
    backgroundImage:     image,
    backgroundImageAlt:  string,
    overlayOpacity:      number,   // 0–100
  },

  // Promo Strip
  promoStrip: {
    isVisible:           boolean,
    text:                string,
    ctaText:             string,
    ctaUrl:              string,
    bgColor:             string,   // hex
    textColor:           string,
    expiresAt:           datetime,
  },

  // Featured Inventory Section
  featuredSection: {
    sectionTitle:        string,
    sectionSubtitle:     string,
    vehicleStockNumbers: string[], // stock numbers only — vehicle data from feeds
    ctaText:             string,
    ctaUrl:              string,
  },

  // Why Choose Us
  whyChooseUs: {
    sectionTitle:        string,
    items: [{
      iconName:          string,
      title:             string,
      description:       text,
    }],
  },

  // Finance CTA Strip
  financeCta: {
    isVisible:           boolean,
    headline:            string,
    subtext:             string,
    ctaText:             string,
    ctaUrl:              string,
    bgColor:             string,
  },

  // Testimonials Section
  testimonialsSection: {
    isVisible:           boolean,
    sectionTitle:        string,
    subtitle:            string,
    // items pulled from testimonial collection (isPublished: true)
  },

  // Trust Badges Section
  trustBadgesSection: {
    isVisible:           boolean,
    sectionTitle:        string,
  },

  // SEO
  metaTitle:             string,
  metaDescription:       text,
  ogImage:               image,
}
```

### Schema 3: `banner` — Collection

```typescript
{
  title:                 string,   // internal label only
  message:               string,
  type:                  enum['info', 'promo', 'urgent', 'seasonal'],
  ctaText:               string,
  ctaUrl:                string,
  bgColor:               string,
  textColor:             string,
  isActive:              boolean,
  startsAt:              datetime,
  endsAt:                datetime,
  displayOnPages:        string[], // page paths or '*' for all
  isDismissible:         boolean,
  priority:              number,   // higher = shown first when multiple active
}
```

### Schema 4: `faqItem` — Collection

```typescript
{
  question:              string,
  answer:                portableText,
  category:              enum[
    'financing',
    'delivery',
    'ev-battery',
    'buying-process',
    'protection-plans',
    'general',
    'ev-education',
  ],
  sortOrder:             number,
  isPublished:           boolean,
  // No slug — FAQs render as accordion on /faq
}
```

### Schema 5: `staticPage` — Collection

```typescript
{
  title:                 string,
  slug:                  slug,     // 'about' | 'finance' | 'sell' | 'contact' | 'faq'
  heroHeadline:          string,
  heroSubheadline:       string,
  heroImage:             image,
  heroImageAlt:          string,
  body:                  portableText,
  sections: [{
    heading:             string,
    body:                portableText,
    image:               image,
    imageAlt:            string,
    imagePosition:       enum['left', 'right', 'none'],
  }],
  ctaBlock: {
    isVisible:           boolean,
    headline:            string,
    buttonText:          string,
    buttonUrl:           string,
  },
  metaTitle:             string,
  metaDescription:       text,
  ogImage:               image,
  noIndex:               boolean,
}
```

### Schema 6: `protectionPlan` — Collection

```typescript
{
  title:                 string,   // 'GAP Coverage'
  slug:                  slug,     // 'gap-coverage' | 'incident-pro' | 'replacement-warranty'
  tagline:               string,
  featuredImage:         image,
  featuredImageAlt:      string,
  highlights: [{
    iconName:            string,
    title:               string,
    description:         text,
  }],
  priceLabel:            string,   // 'Starting at'
  price:                 number,
  priceSuffix:           string,   // '/month' or 'one-time'
  disclaimer:            text,
  body:                  portableText,
  ctaText:               string,
  ctaUrl:                string,
  metaTitle:             string,
  metaDescription:       text,
  ogImage:               image,
  sortOrder:             number,
  isPublished:           boolean,
}
```

### Schema 7: `promoPage` — Collection

```typescript
{
  title:                 string,
  slug:                  slug,     // /promo/[slug]
  heroImage:             image,
  heroImageAlt:          string,
  heroHeadline:          string,
  heroSubheadline:       string,
  body:                  portableText,
  ctaButton: {
    text:                string,
    url:                 string,
  },
  campaignType:          enum['seasonal', 'financing', 'model-specific', 'service', 'general'],
  targetMake:            string,   // optional — for make-specific promos
  isPublished:           boolean,
  publishedAt:           datetime,
  expiresAt:             datetime,
  metaTitle:             string,
  metaDescription:       text,
  ogImage:               image,
  noIndex:               boolean,
}
```

### Schema 8: `blogPost` — Collection

```typescript
{
  title:                 string,
  slug:                  slug,     // /blog/[slug]
  excerpt:               text,     // 1–2 sentences for list view
  featuredImage:         image,
  featuredImageAlt:      string,
  author: {
    name:                string,
    avatar:              image,
    jobTitle:            string,
  },
  categories:            string[], // 'EV Tips' | 'Buying Guide' | 'Market News' | 'EV Education'
  body:                  portableText,
  isPublished:           boolean,
  publishedAt:           datetime,
  metaTitle:             string,
  metaDescription:       text,
  ogImage:               image,
  articleSchema:         boolean,  // emit Article JSON-LD (default: true)
}
```

### Schema 9: `testimonial` — Collection

```typescript
{
  customerName:          string,
  vehiclePurchased:      string,   // '2023 Tesla Model 3'
  rating:                number,   // 1–5
  reviewText:            text,
  reviewDate:            date,
  source:                enum['google', 'facebook', 'direct', 'autotrader', 'carpages'],
  sourceUrl:             url,
  isPublished:           boolean,
  sortOrder:             number,
  isFeatured:            boolean,  // shown in homepage testimonials section
}
```

### Schema 10: `manualListing` — Collection

```typescript
{
  // Matches Vehicle interface in lib/types.ts exactly
  vin:                   string,   // required — dedup key vs feed vehicles
  stock:                 string,
  year:                  number,
  make:                  string,
  model:                 string,
  trim:                  string,
  body:                  string,
  color:                 string,
  colorInt:              string,
  fuel:                  enum['electric', 'hybrid', 'plug-in hybrid', 'gasoline', 'diesel'],
  transmission:          string,
  drivetrain:            string,
  engine:                string,
  doors:                 number,
  seats:                 number,
  km:                    number,
  evRange:               number,
  batteryCapacity:       number,
  price:                 number,   // CAD
  was:                   number,   // previous price — triggers price-drop badge
  status:                enum['available', 'pending', 'sold', 'coming-soon'],
  soldAt:                datetime,
  images: [{
    url:                 url,      // external URL or Sanity asset URL
    alt:                 string,
    isPrimary:           boolean,
    mediaType:           enum['standard', '360', 'video'],
    spin360Url:          url,
    spin360FrameCount:   number,
  }],
  description:           portableText,
  badges:                string[],
  features:              string[],
  isPublished:           boolean,
  source:                string,   // always 'manual' — set programmatically
  // Approval workflow
  priceApprovalStatus:   enum['pending', 'approved', 'rejected'],
  approvedBy:            string,   // Firebase UID
  approvedAt:            datetime,
}
```

---

## 8. ROLES AND PERMISSIONS MODEL

### Six roles — Firebase custom claims

| Role | `role` field value | Description |
|------|-------------------|-------------|
| Owner | `owner` | Full access everywhere |
| Sales Manager | `sales_manager` | Full admin dashboard, can approve price changes |
| Salesperson | `salesperson` | Assigned leads only, can create manual listing drafts |
| Finance Manager | `finance_manager` | Finance leads + reservations only |
| Marketing / Content Editor | `marketing_editor` | Sanity Studio full access, no admin dashboard |
| Customer | `customer` | No admin access |

### Sanity Studio permissions

| Action | Owner | Sales Mgr | Salesperson | Finance Mgr | Mktg Editor | Customer |
|--------|-------|-----------|-------------|-------------|-------------|----------|
| Publish any document | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Edit `siteSettings` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Edit `homepage` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create/publish `banner` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create/publish `promoPage` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create/publish `blogPost` | ✅ | ✅ | ✅ drafts | ❌ | ✅ | ❌ |
| Create/publish `faqItem` | ✅ | ✅ | ✅ drafts | ❌ | ✅ | ❌ |
| Create `manualListing` | ✅ | ✅ | ✅ drafts | ❌ | ❌ | ❌ |
| Publish `manualListing` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload media | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Delete media | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage Studio users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Admin Dashboard permissions

| Action | Owner | Sales Mgr | Salesperson | Finance Mgr | Mktg Editor | Customer |
|--------|-------|-----------|-------------|-------------|-------------|----------|
| Access `/admin` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View all leads | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View assigned leads | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update lead status | ✅ | ✅ | ✅ own | ✅ own | ❌ | ❌ |
| Assign leads to staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all reservations | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View all finance apps | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View all sell requests | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve price change | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage staff roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Three enforcement points

1. **Next.js middleware** — `admin/layout.tsx` server component verifies JWT + role before rendering any admin page
2. **Firestore Security Rules** — `allow read, update` on lead collections requires `role in ['owner', 'sales_manager', 'salesperson', 'finance_manager']`; `config/siteSettings` denies all client reads (`allow read, write: if false`)
3. **Server Action token verification** — All admin mutations go through Server Actions that re-verify the session before writing to Firestore

---

## 9. SOURCE-OF-TRUTH MATRIX

| Data Domain | Source of Truth | Read By | Written By | Never In |
|-------------|----------------|---------|-----------|----------|
| Vehicle inventory (feed) | HomeNet IOL / DriveEAI | `lib/inventory.ts` | Feed APIs (automated) | Sanity, Firestore |
| Manual vehicle listings | Sanity `manualListing` | `lib/inventory.ts` merger | Staff via Studio | Firestore, Feed APIs |
| 360 media data | DriveEAI feed | VDP image component | DriveEAI (automated) | Sanity |
| Homepage content | Sanity `homepage` | `app/page.tsx` RSC | Marketing editor via Studio | `scripts.js`, `lib/types.ts` |
| Static page content | Sanity `staticPage` | Static page RSCs | Marketing editor via Studio | Hardcoded `.ts` files |
| FAQs | Sanity `faqItem` | `/faq` RSC | Any editor via Studio | `scripts.js` |
| Blog posts | Sanity `blogPost` | `/blog` RSC | Marketing editor via Studio | Firestore |
| Promo landing pages | Sanity `promoPage` | `/promo/[slug]` RSC | Marketing editor via Studio | Firestore |
| Site banners | Sanity `banner` | `app/layout.tsx` RSC | Marketing editor via Studio | Firestore |
| Protection plans | Sanity `protectionPlan` | `/protection/[slug]` RSC | Marketing editor via Studio | Hardcoded routes |
| Testimonials | Sanity `testimonial` | Homepage RSC | Staff via Studio | `scripts.js` |
| Dealer identity / business config | Sanity `siteSettings` | All RSCs + Cloud Functions | Owner/editor via Studio | `lib/types.ts` DEALER |
| Navigation / footer | Sanity `siteSettings` | Layout RSC | Owner via Studio | Hardcoded components |
| Financing rate/term | Sanity `siteSettings` | `lib/utils.ts` (cached) | Owner via Studio | `lib/utils.ts` hardcode |
| Delivery pricing | Sanity `siteSettings` | `api/distance/route.ts` | Owner via Studio | Route hardcode |
| Lead routing rules | Sanity `siteSettings` → `config/siteSettings` | Cloud Functions | Owner via Studio | `STAFF_EMAIL` env var |
| Inbound leads (contacts) | Firestore `contacts` | Admin dashboard | Form submission API | Sanity |
| Finance applications | Firestore `leads` | Admin dashboard | Form submission API | Sanity |
| Reservations | Firestore `reservations` | Admin dashboard + Cloud Functions | Form submission API | Sanity |
| Sell/trade requests | Firestore `sellRequests` | Admin dashboard | Form submission API | Sanity |
| Price alert subscriptions | Firestore `priceAlerts` | Cloud Functions | Customer action | Sanity |
| Customer auth + profiles | Firebase Auth + `users` collection | Customer pages + admin | Firebase Auth | Sanity |
| Customer saved vehicles | Firestore `savedVehicles` | Customer account | Customer action | Sanity |
| Runtime business config | Firestore `config/siteSettings` | Cloud Functions | `/api/sanity-sync` webhook | Sanity (write only to Firestore) |
| Customer uploaded photos | Firebase Storage | Admin dashboard | Customer via sell form | Sanity |
| Email delivery | Brevo (via Cloud Functions) | N/A | Cloud Function triggers | Sanity, Firestore direct |
| SEO metadata (inventory) | `lib/seo.ts` `vdpMetadata()` / `srpMetadata()` | VDP/SRP pages | Developer | Sanity |
| SEO metadata (editorial) | Sanity documents | All editorial RSCs | Editors via Studio | `lib/seo.ts` STATIC_META |

---

## 10. MIGRATION PHASES

### Phase A — Core (Must-Have): CMS Infrastructure + Homepage + Admin + Legacy SPA Removal

**Duration target:** 6 weeks | **Outcome:** Legacy SPA deleted; editorial content in Sanity; admin dashboard live

---

#### Phase A1 — Sanity Infrastructure (Week 1)

**Objective:** Stand up Sanity, define all schemas, deploy Studio, seed data. No frontend changes. Site is identical when this phase ends.

**Deliverables:**

1. Create Sanity project — Growth plan, `production` + `staging` datasets
2. Install in `next-app/`: `next-sanity@9`, `@sanity/client`, `@sanity/image-url`, `@portabletext/react`
3. Create `next-app/lib/sanity.ts` — typed `client`, `sanityFetch<T>()`, `urlFor()`
4. Create `next-app/lib/queries.ts` — named GROQ constants for all 10 schemas
5. Implement all 10 schema files in `next-app/sanity/schemas/`
6. Deploy Studio to `studio.planetmotors.app` via Vercel
7. Seed `siteSettings` singleton with all current values from `lib/types.ts`, `lib/utils.ts`, `app/layout.tsx`, `app/api/distance/route.ts`, `functions/index.js`
8. Configure two Sanity webhooks:
   - ISR Revalidation: any publish → `https://www.planetmotors.app/api/revalidate`
   - Site Config Sync: `siteSettings` publish only → `https://www.planetmotors.app/api/sanity-sync`
9. Create `/api/revalidate` and `/api/sanity-sync` Next.js API routes
10. Populate `config/siteSettings` Firestore document via first webhook fire

**What stays as-is:** Everything. Site runs identically.

---

#### Phase A2 — Homepage Migration + Business Config (Week 2)

**Objective:** Replace `<div id="planet-motors-app" />` with real React Server Components. Update financing and delivery to read from Sanity.

**Deliverables:**

1. `firebase-auth.js` dependency audit — written document signed off before any migration
2. `styles.css` pre-deletion audit — visual regression list produced and fixed in component CSS
3. Build homepage RSC components: `HeroBanner`, `PromoStrip`, `FeaturedInventory`, `WhyChooseUs`, `Testimonials`, `TrustBadges`, `FinanceCTA`
4. Replace `app/page.tsx` — remove div shell, render RSCs with Sanity data
5. Navigation component updated to read from `siteSettings.navigationItems`
6. `lib/utils.ts` `estimateBiweekly()` updated to read rate/term from Sanity (cached, 1-hour revalidation, fallback to 7.0/72)
7. `app/api/distance/route.ts` updated to read delivery config from Sanity (cached, fallback to hardcoded values)

**What stays as-is:** All pages except `/`. `scripts.js` still present but no longer drives homepage.

---

#### Phase A3 — Admin Dashboard (Week 3)

**Objective:** Staff can review and manage all inbound leads from a professional internal dashboard.

**Deliverables:**

1. `next-app/lib/firebase-admin.ts` — singleton Admin SDK initialization
2. `admin/layout.tsx` — server-side JWT verify + role check
3. All 7 admin modules built (Overview, Leads, Finance Leads, Reservations, Sell Requests, Inventory, Staff)
4. Real-time unread badge (single Client Component)
5. Status + audit trail writes on all lead mutations
6. `role` field added to Firestore rules and first admin user bootstrapped
7. Cloud Functions updated — `status: 'new'` added to all new document creation

---

#### Phase A4 — Static Pages + Legacy SPA Deletion (Weeks 4–5)

**Objective:** All remaining SPA pages migrated to Sanity RSCs. `scripts.js` deleted.

**Deliverables:**

1. FAQ page — Sanity `faqItem`, grouped by category, sorted by `sortOrder`
2. About, Finance, Sell pages — `StaticPageLayout` RSC from Sanity `staticPage`
3. Contact page — hours from `siteSettings`, form submission unchanged
4. Protection plans — dynamic `app/protection/[slug]/page.tsx` from Sanity `protectionPlan`
5. `/protection/` index from Sanity
6. Sitemap updated with Sanity-driven entries
7. **Legacy SPA deletion sequence** (in exact order):
   - Confirm all migrated pages pass acceptance on staging
   - Content team populates all Sanity documents
   - Remove `<script>` loading `scripts.js` from `index.html`
   - Verify `firebase-auth.js` loaded via Next.js layout
   - Delete `scripts.js`, `index.html`, `styles.css`
   - Deploy, verify production
8. Remove `DEALER` constant from `lib/types.ts`
9. Remove static page metadata exports from `lib/seo.ts`

---

#### Phase A5 — Bot Protection + Lead Routing (Week 6)

**Objective:** Harden form submissions and activate per-form-type email routing.

**Deliverables:**

1. reCAPTCHA v3 added to contact, finance, sell, reservation forms
2. API routes created for all four form submissions (replaces direct Firestore writes)
3. Firestore rules updated — reject direct client writes to lead collections
4. Cloud Functions updated — read routing rules from `config/siteSettings`
5. Cloud Functions updated — deposit amount, SLA, phone from `config/siteSettings`
6. Cloud Functions redeployed and tested on Firebase Emulator

---

### Phase B — Secondary Capabilities: Blog, Promos, Banners, Manual Listings

**Duration target:** 2 weeks | **Outcome:** Full content platform activated; manual inventory live

---

#### Phase B1 — Blog + Promo Pages + Banners (Week 7)

**Deliverables:**

1. `/blog` and `/blog/[slug]` from Sanity `blogPost`
2. `/promo/[slug]` from Sanity `promoPage` (expired → 404)
3. `Banner` component in `app/layout.tsx` — scheduled, targeted, dismissible
4. Manual listing Sanity schema activated and seeded

---

#### Phase B2 — Manual Listings + Staff Onboarding (Week 8)

**Deliverables:**

1. `fetchSanityManualListings()` in `next-app/lib/sanity-inventory.ts`
2. Inventory merger updated with third source (manual fills VIN gaps only)
3. `/admin/inventory` module for managing manual listings
4. Staff SOP document delivered
5. Handoff acceptance test — content team performs all workflows without developer

---

## 11. ACCEPTANCE CRITERIA BY PHASE

### Phase A1 Acceptance Criteria

- [ ] Sanity Studio loads at `studio.planetmotors.app` with all 10 schemas visible
- [ ] `siteSettings` singleton is fully populated — all values match codebase exactly
- [ ] `config/siteSettings` Firestore document populated after webhook fire
- [ ] `/api/sanity-sync` returns 401 for invalid secret, 200 for valid
- [ ] `/api/revalidate` returns 200 on valid webhook call
- [ ] All environment variables present in Vercel project settings
- [ ] Live site is identical to pre-Phase-A1 — zero regressions

### Phase A2 Acceptance Criteria

- [ ] `app/page.tsx` contains zero references to `scripts.js` or `planet-motors-app`
- [ ] Hero image + headline editable from Studio — change live within 60 seconds (target SLA)
- [ ] `PromoStrip` hides at `expiresAt` without code change
- [ ] `FeaturedInventory` renders gracefully when a stock number is absent from feeds
- [ ] Homepage LCP ≤ 2.5s, CLS ≤ 0.1 (measured against pre-migration baseline)
- [ ] JSON-LD schema values sourced from Sanity `siteSettings` — zero hardcoded values
- [ ] Navigation item added in Studio appears on site within 60 minutes (target SLA)
- [ ] Changing `defaultFinancingRate` in Studio updates biweekly figures within 60 minutes (target SLA)
- [ ] Changing delivery tier in Studio updates calculator within 60 minutes (target SLA)

### Phase A3 Acceptance Criteria

- [ ] `/admin` returns redirect to `/` for unauthenticated users
- [ ] `/admin` returns redirect to `/` for `role: 'customer'` users
- [ ] Correct pending lead counts displayed on overview page
- [ ] Unread badge increments in real-time within 5 seconds of new submission
- [ ] Status update writes `updatedAt`, `updatedBy`, `updatedByName` to Firestore
- [ ] Notes append without overwriting prior notes
- [ ] Firebase Admin SDK absent from all client bundles (verified via `next build` analysis)
- [ ] `/admin/settings/staff` inaccessible to non-owner roles

### Phase A4 Acceptance Criteria

- [ ] `scripts.js` does not exist in the repository
- [ ] `index.html` does not exist in the repository
- [ ] `styles.css` does not exist in the repository
- [ ] Zero JavaScript console errors on any page in production
- [ ] All four form submission flows work: contact, finance, sell, reservation
- [ ] Cloud Function emails fire after each form submission
- [ ] Firebase Auth flows work: sign in, sign out, Google OAuth
- [ ] All protection plan URLs return HTTP 200
- [ ] `/protection/unknown-slug` returns HTTP 404
- [ ] All sitemap URLs return HTTP 200
- [ ] `lib/types.ts` contains no `DEALER` constant
- [ ] `lib/seo.ts` contains no static page metadata exports
- [ ] VDP and SRP inventory pages unchanged

### Phase A5 Acceptance Criteria

- [ ] Form submission with reCAPTCHA score < 0.5 returns HTTP 400 — no Firestore write
- [ ] Direct browser write to `contacts` collection returns Firestore permission denied
- [ ] Changing `leadRoutingRules` in Studio routes next contact form email to new address
- [ ] Changing `vehicleDepositAmount` in Studio → next reservation email shows new amount
- [ ] All Cloud Functions pass Firebase emulator tests post-redeploy

### Phase B2 Acceptance Criteria (Final Handoff)

- [ ] Publishing `manualListing` in Studio adds vehicle to `/inventory/used` within 5 minutes (target SLA)
- [ ] Manual listing with duplicate VIN from feeds is suppressed (feed wins)
- [ ] Content team lead completes all 11 handoff acceptance test tasks without developer assistance
- [ ] SOP document delivered and reviewed

---

## 12. RISKS, CONTROLS, AND ROLLBACK CONSIDERATIONS

### Risk 1: `firebase-auth.js` form breakage during SPA deletion
**Threat:** `firebase-auth.js` is loaded via `index.html`. Deleting `index.html` without migrating the script load to Next.js layout silently breaks all form submissions.
**Control:** Dependency audit (Phase A2 prerequisite) maps every function and load path before any deletion.
**Rollback:** Restore `index.html` from git history. Script tag restoration takes < 5 minutes.

### Risk 2: `styles.css` visual regressions
**Threat:** Global styles in `styles.css` bleed into Next.js component rendering. Deleting the file without an audit causes visual regressions.
**Control:** Pre-deletion audit (Phase A2) runs site with empty `styles.css` on staging. All regressions fixed in component CSS before production deletion.
**Rollback:** Restore file from git history.

### Risk 3: Sanity feed for inventory vs. editorial confusion
**Threat:** Someone attempts to manage inventory records in Sanity — creating sync conflicts with HomeNet and DriveEAI.
**Control:** `manualListing` schema has clear Studio helper text. SOP explicitly states: "Do not recreate HomeNet/DriveEAI vehicles in Sanity." Manual listings only fill VIN gaps.
**Rollback:** N/A — architectural boundary, not a runtime risk.

### Risk 4: Sanity API outage
**Threat:** Sanity CDN unavailable — all CMS-driven pages serve stale or empty content.
**Control:** `revalidate` on all `sanityFetch` calls means ISR cache serves last-known-good content. `sanityFetch` returns `null` on failure, never throws. All components have null-safe rendering with fallback UI.
**Rollback:** None needed — ISR cache continues serving.

### Risk 5: Cloud Function redeploy failure
**Threat:** Syntax error in `functions/index.js` during lead routing update silences all email notifications.
**Control:** Test on Firebase Emulator before every Cloud Function deploy. `STAFF_EMAIL` env var remains as hard fallback.
**Rollback:** `firebase deploy --only functions` with previous known-good version from git.

### Risk 6: SEO regression on migrated pages
**Threat:** Page titles, meta descriptions, heading hierarchy change post-migration — Google ranking affected.
**Control:** Every migrated page's rendered HTML `<head>` is compared against pre-migration baseline in staging before promotion to production.
**Rollback:** Revert `page.tsx` to hardcoded version, redeploy.

### Risk 7: Sanity Growth tier cost surprise
**Threat:** Free tier (3 users) is insufficient for the team. Growth tier ($99/month CAD equivalent) is required from day one.
**Control:** Growth plan budgeted before project begins. Do not start on free tier.
**Rollback:** N/A — plan upgrade before work starts.

### Risk 8: `estimateBiweekly` async refactor breaks callers
**Threat:** Changing the function signature to `Promise<number>` breaks every call site that treats it as synchronous.
**Control:** Audit all call sites before changing signature. Add `await` to all callers. TypeScript compilation catches any missed sites.
**Rollback:** Revert function to synchronous with hardcoded fallback values.

### Risk 9: Premature `scripts.js` deletion
**Threat:** Deleting `scripts.js` before all pages it powers are verified on production causes live site outages.
**Control:** Deletion is the final step of Phase A4, not a milestone. Every page it powers must pass acceptance on staging before deletion. The 12-step deletion sequence must be followed in order.
**Rollback:** Restore from git history. Restoration takes < 5 minutes.

### Risk 10: URL changes post-migration
**Threat:** Any URL change on migrated pages loses Google indexing.
**Control:** All migrated pages must resolve at exactly the same URL path as before. No redirects introduced. SEO audit run in staging before every page cutover.
**Rollback:** Revert route file, redeploy.

---

## 13. FUTURE-READY CAPABILITIES INCLUDED FROM DAY ONE

The following capabilities are **planned and architected now** even where not activated immediately. None of these require re-architecture to enable — they are enabled by configuration, content, or a single schema addition.

| Capability | Architecture Status | Activation Path |
|-----------|--------------------|--------------------|
| Blog publishing | Schema defined, routes built in Phase B1 | Publish first `blogPost` in Studio |
| Promo landing pages | Schema defined, route built in Phase B1 | Publish first `promoPage` in Studio |
| Scheduled site-wide banners | Schema defined, component built in Phase B1 | Create `banner` with `startsAt`/`endsAt` |
| Manual vehicle listings | Schema defined, merger updated in Phase B2 | Publish first `manualListing` in Studio |
| "Coming soon" inventory | `status: 'coming-soon'` in `manualListing` schema | Set `status` in Studio, render on SRP |
| 360 media on VDP | `VehicleImage.mediaType` + `spin360Url` fields added | DriveEAI provides 360 data; VDP tab activates |
| Seasonal sales pages | `promoPage.campaignType: 'seasonal'` | Create a seasonal `promoPage` |
| EV education pages | `staticPage` or `blogPost` with `categories: ['EV Education']` | Author content in Studio |
| Per-form-type lead routing | `leadRoutingRules[]` in `siteSettings` | Update rules in Studio — Cloud Functions read from Firestore config |
| Finance campaign pages | `promoPage.campaignType: 'financing'` | Create a financing campaign `promoPage` |
| Make-specific promo pages | `promoPage.targetMake` field | Set make, build targeted campaign |
| City/service SEO pages | `staticPage` with custom slug | Create `staticPage` for any city slug |
| Buyer guide / comparison content | `blogPost` with `categories: ['Buying Guide']` | Author in Studio |
| Reputation widget | `testimonial.isFeatured` + aggregate from `siteSettings.ratingDisplay` | Already in schema — build component |
| Protection product expansion | New `protectionPlan` document | Author in Studio — route resolves automatically |
| Future approval workflow for price changes | `manualListing.priceApprovalStatus` field present | Build approval UI in admin dashboard |
| Staff-specific lead routing | `assignedTo` on all lead collections | Admin assigns leads; staff sees own queue |
| Staging content preview | Sanity `staging` dataset (Growth tier) | Staff authors in staging, promotes to production |
| Inventory promo sections | `homepage.featuredSection.vehicleStockNumbers[]` | Update stock numbers in Studio |
| Review/reputation widgets | `testimonial` collection + `siteSettings.ratingDisplay` | Already in schema — populate and build component |
| Reusable CTA blocks | `ctaBlock` Portable Text block type | Embed in any page body |
| Multi-section landing pages | `staticPage.sections[]` array | Add sections in Studio |
| Trust badge module | `siteSettings.trustBadges[]` | Update badges in Studio |
| Financing calculator widget | `siteSettings.financingDefaults` already CMS-driven | Build interactive component |
| `noIndex` campaign pages | `promoPage.noIndex: true` | Toggle in Studio |

---

## 14. FINAL HANDOFF MODEL

### What the internal team owns — zero developer required

| Operation | Tool | Target Latency |
|-----------|------|---------------|
| Update homepage hero image + headline | Sanity Studio → `homepage` | ≤ 60s (target) |
| Activate/schedule/deactivate banners | Sanity Studio → `banner` | ≤ 60s (target) |
| Add / edit / delete FAQ items | Sanity Studio → `faqItem` | ≤ 60s (target) |
| Publish blog post | Sanity Studio → `blogPost` | ≤ 60s (target) |
| Create promo landing page | Sanity Studio → `promoPage` | ≤ 60s (target) |
| Update static page copy | Sanity Studio → `staticPage` | ≤ 60s (target) |
| Update protection plan content | Sanity Studio → `protectionPlan` | ≤ 60s (target) |
| Add a manual vehicle listing | Sanity Studio → `manualListing` | ≤ 5 min (target) |
| Update dealer hours / phone / address | Sanity Studio → `siteSettings` | ≤ 60s (target) |
| Update financing rate / term | Sanity Studio → `siteSettings` | ≤ 60 min (cached) |
| Update delivery pricing tiers | Sanity Studio → `siteSettings` | ≤ 60 min (cached) |
| Change deposit amount in emails | Sanity Studio → `siteSettings` → Firestore sync | ≤ 2 min (target) |
| Route lead types to different staff emails | Sanity Studio → `siteSettings` | ≤ 2 min (target) |
| Update Google rating count | Sanity Studio → `siteSettings` | ≤ 60 min (target) |
| Add / remove navigation items | Sanity Studio → `siteSettings` | ≤ 60 min (target) |
| Review inbound leads | Admin Dashboard → `/admin/leads` | Real-time |
| Review finance applications | Admin Dashboard → `/admin/finance-leads` | Real-time |
| Review reservations | Admin Dashboard → `/admin/reservations` | Real-time |
| Review sell / trade-in requests | Admin Dashboard → `/admin/sell-requests` | Real-time |
| Update lead / reservation status | Admin Dashboard → detail page | Immediate |
| Write internal notes on a lead | Admin Dashboard → detail page | Immediate |
| Assign lead to staff member | Admin Dashboard → detail page | Immediate |
| Manage manual listings | Admin Dashboard → `/admin/inventory` | Immediate |
| Manage staff roles | Admin Dashboard → `/admin/settings/staff` | Immediate |
| Add new Studio users | Sanity Console → Members | Immediate |

> **Note on timing targets:** Latency figures are design goals and SLAs to monitor — not absolute guarantees. Real-world latency depends on Sanity CDN health, Vercel ISR revalidation queue, and network conditions. Design toward these targets and instrument monitoring against them post-launch.

### What still requires a developer

| Operation | Reason | Expected Frequency |
|-----------|--------|-------------------|
| Add a new Sanity schema field | Code change + Studio redeploy | Rare |
| Add a new Next.js page route | `app/[route]/page.tsx` creation | Occasional |
| Modify Cloud Function trigger logic | `functions/index.js` change | Rare |
| Change form field structure | Validation + Cloud Function + rules | Rare |
| Add a new inventory feed source | `lib/inventory.ts` modification | Rare |
| First admin user bootstrap (one-time) | One Firestore Console write | One time only |
| Rotate API keys | Environment variable update | Periodic |
| Modify Firestore security rules | `firestore.rules` + deploy | Rare |
| Change email template HTML | `functions/index.js` | Occasional |
| Add new inventory feed category pages to SRP/sitemap | Hardcoded category routes | Occasional |

### Content publish → live latency model

| Action | System Path | Target Latency |
|--------|------------|---------------|
| Publish any Sanity document | Sanity Webhook → `/api/revalidate` → Vercel ISR | ≤ 60 seconds |
| Publish `siteSettings` | Above + `/api/sanity-sync` → Firestore `config/siteSettings` | ≤ 2 minutes |
| Inventory update from feeds | HomeNet/DriveEAI → ISR `revalidate: 300` | ≤ 5 minutes |
| Manual listing publish | Sanity → `fetchSanityManualListings` `revalidate: 60` | ≤ 5 minutes |
| New blog post | Sanity Webhook → Vercel ISR | ≤ 60 seconds |
| New promo page | Sanity Webhook → Vercel ISR | ≤ 60 seconds |
| Banner activation at scheduled time | `revalidate: 60` on banner component | ≤ 60 seconds |
| Financing rate update in email | Sanity → Firestore sync → Cloud Function reads | ≤ 2 minutes |

### Definition of done

The HEADLESS WEBCMS implementation is complete when a non-technical team member can perform **every operation in the "What the internal team owns" table above** from a cold start — without asking a developer, without opening a Firebase Console, without accessing a Firestore document directly, without touching any code file, and without reading this document.

That is the acceptance criterion for the project as a whole.

---

## APPENDIX A: ENVIRONMENT VARIABLES — COMPLETE LIST

```bash
# ── Existing (unchanged) ─────────────────────────────────────────────
HOMENET_DEALER_ID=
HOMENET_API_KEY=
HOMENET_FEED_URL=
DRIVEAI_DEALER_ID=
DRIVEAI_API_KEY=
DRIVEAI_API_URL=
GOOGLE_MAPS_API_KEY=
BREVO_API_KEY=          # Firebase Functions config
STAFF_EMAIL=            # Firebase Functions config — hard fallback only
FROM_EMAIL=             # Firebase Functions config

# ── New — Sanity ─────────────────────────────────────────────────────
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STAGING_DATASET=staging
SANITY_API_TOKEN=            # read-only — safe for SSR, never expose client-side
SANITY_WRITE_TOKEN=          # write — used only in /api/sanity-sync server route
SANITY_WEBHOOK_SECRET=       # validates incoming Sanity webhook calls

# ── New — Firebase Admin ──────────────────────────────────────────────
FIREBASE_SERVICE_ACCOUNT_JSON=   # base64-encoded service-account.json
                                  # NEVER commit this file to the repository

# ── New — Bot Protection ──────────────────────────────────────────────
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=  # public — safe for browser
RECAPTCHA_SECRET_KEY=             # server-only — verify in API routes
```

---

## APPENDIX B: REQUIRED API CONNECTIONS

| API | Caller | Auth | Direction | New? |
|-----|--------|------|-----------|------|
| HomeNet IOL | `lib/homenet.ts` | API key header | Outbound server | No |
| DriveEAI | `lib/driveai.ts` | API key header | Outbound server | No |
| Google Maps Distance Matrix | `api/distance/route.ts` | Key in query | Outbound server | No |
| Brevo SMTP | `functions/index.js` | API key | Outbound Cloud Function | No |
| Firebase Auth | `firebase-auth.js` | Firebase SDK | Bidirectional client | No |
| Firestore (client) | `firebase-auth.js` | Firebase SDK | Bidirectional client | No |
| Firestore (admin) | `lib/firebase-admin.ts` | Service account | Outbound server | **Yes** |
| Sanity GROQ API | `lib/sanity.ts` | Read-only token | Outbound server | **Yes** |
| Sanity Asset Upload | Sanity Studio browser | Studio session | Outbound browser | **Yes** |
| Sanity Webhook → Vercel | Sanity (outbound) | Deploy Hook URL | Sanity → Vercel | **Yes** |
| Sanity Webhook → `/api/sanity-sync` | Sanity (outbound) | Shared secret header | Sanity → Next.js | **Yes** |
| Google reCAPTCHA v3 | Form API routes | Secret key | Outbound server | **Yes** |

---

*Document: HEADLESS WEBCMS — Planet Motors*
*Version: 2.0 | 2026-03-16 | Branch: claude/star-project-dOjvA*
*All file paths, field names, and values reference the actual `/home/user/Website` repository.*
