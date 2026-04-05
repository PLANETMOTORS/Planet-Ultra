import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin';
import { getAdminOpsSnapshot } from '@/lib/ops/adminSnapshot';

/**
 * GET /api/admin/ops
 *
 * Admin-only operational snapshot endpoint.
 */
export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const snapshot = await getAdminOpsSnapshot();
  return NextResponse.json({ ok: true, snapshot }, { status: 200 });
}
