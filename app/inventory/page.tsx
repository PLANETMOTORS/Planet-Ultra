import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Inventory listing page.
 * Revalidates every 5 minutes — vehicle availability changes frequently.
 * Data will be populated in a later phase from Postgres.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Used Vehicle Inventory',
  description:
    'Browse quality used vehicles at Planet Motors. OMVIC registered dealer in Ontario with transparent pricing, vehicle history, and financing options.',
  alternates: {
    canonical: '/inventory',
  },
  openGraph: {
    title: 'Used Vehicle Inventory | Planet Motors',
    description:
      'Browse quality used vehicles at Planet Motors. OMVIC registered dealer in Ontario.',
    type: 'website',
  },
};

export default function InventoryPage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory" aria-current="page">
              Shop Inventory
            </Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h1>Used Vehicle Inventory</h1>
            <p className="muted">
              Quality used vehicles from an OMVIC registered Ontario dealer.
            </p>
          </div>
          {/* Inventory grid — live data from Postgres to be wired in a future phase */}
          <div className="card-grid three-up" aria-label="Vehicle inventory">
            <p className="muted">Inventory loading placeholder — live data coming soon.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
          </div>
          <div className="footer-links">
            <Link href="/inventory">Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
