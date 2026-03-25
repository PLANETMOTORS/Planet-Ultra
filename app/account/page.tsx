import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

/**
 * /account — protected. Clerk middleware enforces auth before this renders.
 * If middleware is bypassed, server-side double-check redirects to sign-in.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main>
      <div className="container section">
        <h1>My Account</h1>
        <p className="muted">
          Welcome{user.firstName ? `, ${user.firstName}` : ''}.
        </p>
        <nav aria-label="Account navigation">
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="/saved">Saved Vehicles</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
