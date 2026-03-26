import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks/autoraptor
 * Status: STUB / RESERVED
 *
 * AutoRaptor may send event callbacks (e.g. lead status updates).
 * This handler validates the shared secret and acknowledges receipt.
 * Full event handling is a future deliverable.
 */

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.AUTORAPTOR_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get('x-autoraptor-secret');

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  console.info('[webhook/autoraptor] Event received (stub)', { type: body['type'] ?? 'unknown' });

  return NextResponse.json({ received: true, status: 'stub' }, { status: 200 });
}
