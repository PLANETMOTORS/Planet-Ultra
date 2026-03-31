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
import { beginWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/eventStore';

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
  let rawBody = '';
  try {
    rawBody = await req.text();
    body = JSON.parse(rawBody) as SanityWebhookBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const docType = body._type ?? 'unknown';
  const eventId =
    req.headers.get('x-sanity-event-id') ??
    `${docType}:${body.slug?.current ?? 'no-slug'}:${rawBody.length}`;

  const eventStoreResult = await beginWebhookEvent({
    provider: 'sanity',
    eventId,
    eventType: `sanity.${docType}`,
    payload: body as Record<string, unknown>,
  });
  if (eventStoreResult === 'duplicate') {
    return NextResponse.json({ revalidated: true, duplicate: true, docType }, { status: 200 });
  }

  console.info('[webhook/sanity] Revalidation triggered', { docType });

  try {
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
    await completeWebhookEvent({
      provider: 'sanity',
      eventId,
      success: true,
    });
  } catch (err) {
    await completeWebhookEvent({
      provider: 'sanity',
      eventId,
      success: false,
      errorMessage: (err as Error).message,
    });
    throw err;
  }

  return NextResponse.json({ revalidated: true, docType }, { status: 200 });
}
