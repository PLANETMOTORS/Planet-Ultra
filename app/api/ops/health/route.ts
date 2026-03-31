import { NextRequest, NextResponse } from 'next/server';
import { getOpsSnapshot } from '@/lib/ops/metrics';

/**
 * GET /api/ops/health
 *
 * Lightweight operational snapshot for execution evidence.
 * Access protected by OPS_API_SECRET via x-ops-secret header.
 */
export async function GET(req: NextRequest) {
  const expectedSecret = process.env.OPS_API_SECRET;
  const receivedSecret = req.headers.get('x-ops-secret');

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = await getOpsSnapshot();
  return NextResponse.json(
    {
      ok: true,
      at: new Date().toISOString(),
      snapshot,
    },
    { status: 200 },
  );
}
