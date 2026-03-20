// ============================================================
// Planet Motors — Sanity Schema Index
// Import this in your Sanity Studio's sanity.config.ts
// ============================================================

import siteSettings from './schemas/siteSettings';
import homepage     from './schemas/homepage';
import blogPost     from './schemas/blogPost';
import faqItem      from './schemas/faqItem';
import promotion    from './schemas/promotion';
import staticPage   from './schemas/staticPage';

export const schemaTypes = [
  // Singletons (one document each)
  siteSettings,
  homepage,

  // Collections
  blogPost,
  faqItem,
  promotion,
  staticPage,
];
