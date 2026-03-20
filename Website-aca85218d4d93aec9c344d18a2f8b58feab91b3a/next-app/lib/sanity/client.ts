// ============================================================
// Planet Motors — Sanity Client
// Project: cgb59sfd | Dataset: production
// ============================================================

import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'cgb59sfd',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production',
  apiVersion: '2024-01-01',
  useCdn:    process.env.NODE_ENV === 'production',
};

export const client = createClient(sanityConfig);

// Image URL builder — use urlFor(source).width(800).url()
const builder = imageUrlBuilder(sanityConfig);
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Fetch with optional Next.js cache tags
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: 60,   // ISR: revalidate every 60 s by default
      ...(tags ? { tags } : {}),
    },
  });
}
