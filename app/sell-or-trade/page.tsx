import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sell or Trade Your Vehicle',
  description:
    'Get a fast trade-in offer from Planet Motors. Submit your vehicle details online and schedule pickup.',
  alternates: { canonical: '/sell-or-trade' },
};

export default function SellOrTradePage() {
  return (
    <main>
      <div className="container section">
        <h1>Sell or Trade Your Vehicle</h1>

        <div className="card" style={{ marginBottom: '16px' }}>
          <p className="muted" style={{ marginBottom: '12px' }}>
            Trade-in lifecycle is now active in backend APIs:
          </p>
          <ul className="muted" style={{ marginLeft: '18px' }}>
            <li>
              <code>POST /api/trade-in/offer</code> — instant offer + 7-day expiry
            </li>
            <li>
              <code>POST /api/trade-in/accept</code> — accept offer + pickup scheduling
            </li>
            <li>
              <code>GET /api/trade-in/status</code> — customer status lookup
            </li>
            <li>
              <code>POST /api/webhooks/tradein</code> — inspected/completed terminal updates
            </li>
          </ul>
        </div>

        <div className="card">
          <p className="muted">
            Frontend stepper UI for plate/VIN lookup and condition questions will be
            connected next. For now, backend trade-in workflow is implemented and ready
            for API-driven integration.
          </p>
          <div style={{ marginTop: '14px' }}>
            <Link className="button button-primary" href="/inventory">
              Continue to Inventory
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
