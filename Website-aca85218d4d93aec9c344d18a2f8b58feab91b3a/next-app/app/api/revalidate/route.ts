// ============================================================
// Planet Motors — Sanity ISR Revalidation Webhook
// POST /api/revalidate
// Called by Sanity webhooks on document publish/unpublish.
// Revalidates Next.js cache tags mapped to the document type.
// ============================================================

import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Maps Sanity document _type → Next.js cache tags to revalidate
const TYPE_TO_TAGS: Record<string, string[]> = {
  siteSettings:      ['site-settings'],
  navigation:        ['site-settings'],
  footer:            ['site-settings'],
  financingDefaults: ['site-settings'],
  deliverySettings:  ['site-settings'],
  reviewSettings:    ['site-settings'],
  homepage:          ['homepage'],
  trustBadge:        ['homepage'],
  testimonial:       ['homepage'],
  ctaBlock:          ['homepage'],
  staticPage:        ['static-pages'],
  faqItem:           ['static-pages'],
  protectionProduct: ['static-pages'],
  staffMember:       ['static-pages'],
  blogPost:          ['blog'],
  landingPage:       ['landing-pages'],
  banner:            ['promos'],
  promotion:         ['promos'],
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-webhook-secret');

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: { _type?: string } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const documentType = body._type;

  if (!documentType) {
    return NextResponse.json({ message: 'Missing _type in body' }, { status: 400 });
  }

  const tags = TYPE_TO_TAGS[documentType];

  if (!tags || tags.length === 0) {
    // Unknown type — revalidate nothing, return success
    return NextResponse.json({
      revalidated: false,
      message: `No tag mapping for type: ${documentType}`,
    });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    revalidated: true,
    documentType,
    tags,
  });
}
