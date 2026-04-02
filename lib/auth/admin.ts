import { auth } from '@clerk/nextjs/server';

function parseAdminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_CLERK_USER_IDS ?? '';
  return new Set(
    raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  );
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return parseAdminAllowlist().has(userId);
}

export async function requireAdminSession(): Promise<
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: 'Unauthorized' | 'Forbidden' }
> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  if (!isAdminUserId(userId)) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }
  return { ok: true, userId };
}
