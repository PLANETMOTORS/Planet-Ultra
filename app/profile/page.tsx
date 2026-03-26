import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

/**
 * /profile — protected. Clerk-managed profile; editing happens via Clerk
 * hosted UI or embedded <UserProfile /> component (added in a future pass).
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main>
      <div className="container section">
        <h1>Profile</h1>
        <dl className="spec-list">
          <div className="spec-row">
            <dt>Name</dt>
            <dd>
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div className="spec-row">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
        <p className="muted" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
          To update your name or email, visit your account settings.
        </p>
      </div>
    </main>
  );
}
