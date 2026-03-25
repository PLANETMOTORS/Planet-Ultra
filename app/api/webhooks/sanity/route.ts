import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks/sanity
 * Status: ACTIVE — on-demand ISR revalidation
 *
 * Sanity calls this endpoint when content is published.
 * Validates a shared secret header, then triggers Next.js revalidatePath
 * for the affected surface.
 *
 * Handled document types:
 * - siteSettings, navigation, footer → revalidate '/'
 * - homePage                         → revalidate '/'
 * - vehicle                          → revalidate '/inventory', '/sitemap.xml'
 *
 * All other types are acknowledged (200) and logged.
 */

import { revalidatePath } from 'next/cache';

interface SanityWebhookBody {
  _type?: string;
  slug?: { current?: string };
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const receivedSecret = req.headers.get('x-revalidate-secret');

  if (!secret || receivedSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SanityWebhookBody;
  try {
    body = (await req.json()) as SanityWebhookBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const docType = body._type ?? 'unknown';
  console.info('[webhook/sanity] Revalidation triggered', { docType });

  switch (docType) {
    case 'siteSettings':
    case 'navigation':
    case 'footer':
    case 'homePage':
      revalidatePath('/');
      break;
    case 'vehicle':
      revalidatePath('/inventory');
      revalidatePath('/sitemap.xml');
      break;
    default:
      break;
  }

  return NextResponse.json({ revalidated: true, docType }, { status: 200 });
}
