import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks/routeone
 * Status: STUB / RESERVED
 *
 * RouteOne may send credit application status callbacks.
 * Validates shared secret, acknowledges receipt. Full handling is future work.
 */

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.ROUTEONE_WEBHOOK_SECRET;
  const receivedSecret = req.headers.get('x-routeone-secret');

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  console.info('[webhook/routeone] Event received (stub)', { type: body['type'] ?? 'unknown' });

  return NextResponse.json({ received: true, status: 'stub' }, { status: 200 });
}
