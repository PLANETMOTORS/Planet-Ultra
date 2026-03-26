import { auth, currentUser } from '@clerk/nextjs/server';
import type { SessionUser } from '@/types/a5';

/**
 * Returns the resolved SessionUser from the Clerk session, or null if
 * the request is unauthenticated. Safe to call from any Server Component
 * or Route Handler.
 *
 * Never passes raw Clerk user objects beyond this boundary — callers
 * receive a typed SessionUser with only the fields A5 needs.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );

  return {
    clerkUserId: user.id,
    email: primaryEmail?.emailAddress ?? '',
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
  };
}

/**
 * Returns the Clerk userId from the current session, or null.
 * Lighter than getSessionUser() — use when only the ID is needed.
 */
export async function getSessionUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}
