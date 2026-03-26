import type { Metadata } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getSavedVehicles } from '@/lib/auth/savedVehicles';

/**
 * /saved — protected. Shows the authenticated user's saved vehicle list.
 * Saved state is read from Postgres via the server-side helper.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Saved Vehicles',
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/sign-in');
  }

  const saved = await getSavedVehicles(user.clerkUserId);

  return (
    <main>
      <div className="container section">
        <h1>Saved Vehicles</h1>
        {saved.length === 0 ? (
          <p className="muted">
            You have no saved vehicles yet. Browse{' '}
            <Link href="/inventory">inventory</Link> to save vehicles.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {saved.map((v) => (
              <li key={v.vehicleId} className="card">
                <Link href={`/inventory/${v.vehicleSlug}`}>{v.vehicleSlug}</Link>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  Saved {new Date(v.savedAt).toLocaleDateString('en-CA')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
