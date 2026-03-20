// ============================================================
// Planet Motors — GROQ Queries
// ============================================================

// ── Site Settings (singleton) ────────────────────────────────
export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    dealerName,
    phone,
    email,
    address,
    city,
    province,
    postalCode,
    lat,
    lng,
    omvicNumber,
    hours[] { day, hours },
    socialLinks { facebook, instagram, twitter, youtube },
    googleMapsEmbedUrl,
    announcementBar { enabled, message, link }
  }
`;

// ── Homepage (singleton) ─────────────────────────────────────
export const HOMEPAGE_QUERY = `
  *[_type == "homepage"][0] {
    hero {
      headline,
      subheadline,
      ctaPrimary { label, url },
      ctaSecondary { label, url },
      backgroundImage { asset->{ url }, alt }
    },
    trustBadges[] { icon, label, value },
    featuredVehicleStockNumbers,
    promoBanner { enabled, headline, body, ctaLabel, ctaUrl, bgColor },
    testimonials[] { name, rating, body, date },
    faqHighlights[]->{ _id, question, answer, category }
  }
`;

// ── Blog ─────────────────────────────────────────────────────
export const BLOG_LIST_QUERY = `
  *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug { current },
    publishedAt,
    excerpt,
    category,
    coverImage { asset->{ url }, alt },
    author { name, avatar { asset->{ url } } }
  }
`;

export const BLOG_POST_QUERY = `
  *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug { current },
    publishedAt,
    excerpt,
    category,
    coverImage { asset->{ url }, alt },
    author { name, bio, avatar { asset->{ url } } },
    body
  }
`;

export const BLOG_SLUGS_QUERY = `
  *[_type == "blogPost" && !(_id in path("drafts.**"))] {
    "slug": slug.current
  }
`;

// ── FAQ ──────────────────────────────────────────────────────
export const FAQ_QUERY = `
  *[_type == "faqItem" && !(_id in path("drafts.**"))] | order(order asc) {
    _id,
    question,
    answer,
    category,
    order
  }
`;

// ── Promotions ───────────────────────────────────────────────
export const ACTIVE_PROMOS_QUERY = `
  *[_type == "promotion" && active == true && !(_id in path("drafts.**"))] | order(order asc) {
    _id,
    title,
    headline,
    body,
    ctaLabel,
    ctaUrl,
    image { asset->{ url }, alt },
    pages,
    order
  }
`;

// ── Static Page Content ──────────────────────────────────────
export const STATIC_PAGE_QUERY = `
  *[_type == "staticPage" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug { current },
    seoTitle,
    seoDescription,
    body,
    sections[] {
      _type,
      _key,
      headline,
      body,
      image { asset->{ url }, alt },
      items[] { label, value, icon }
    }
  }
`;
