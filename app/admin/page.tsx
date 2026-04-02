import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/admin';
import { getAdminOpsSnapshot } from '@/lib/ops/adminSnapshot';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Operations',
  description: 'Planet Ultra admin operations dashboard.',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    if (admin.status === 401) {
      redirect('/sign-in?redirect_url=/admin');
    }
    return (
      <main>
        <div className="container section">
          <h1>Admin Operations</h1>
          <div className="card">
            <p className="muted">Forbidden: your account is not in the admin allowlist.</p>
            <p className="muted">
              Set <code>ADMIN_CLERK_USER_IDS</code> in environment configuration to grant access.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const snapshot = await getAdminOpsSnapshot();

  return (
    <main>
      <div className="container section">
        <h1>Admin Operations</h1>
        <p className="muted" style={{ marginBottom: '16px' }}>
          Read-only MVP panel for lifecycle monitoring and proof-pack readiness.
        </p>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h2>Core Counters</h2>
          <p className="muted">Generated at: {snapshot.generatedAt}</p>
          <pre style={{ overflowX: 'auto' }}>
            {JSON.stringify(snapshot.core, null, 2)}
          </pre>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h2>Recent Finance</h2>
          <pre style={{ overflowX: 'auto' }}>
            {JSON.stringify(snapshot.recentFinance, null, 2)}
          </pre>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h2>Recent Webhooks</h2>
          <pre style={{ overflowX: 'auto' }}>
            {JSON.stringify(snapshot.recentWebhooks, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h2>Recent CRM Dispatch</h2>
          <pre style={{ overflowX: 'auto' }}>
            {JSON.stringify(snapshot.recentCrmDispatch, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
