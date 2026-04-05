import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Compare Vehicle Options',
  description:
    'Compare vehicle classes and buying paths to choose the best fit for your budget and usage.',
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <Link href="/compare" aria-current="page">
              Compare
            </Link>
            <Link href="/finance">Finance</Link>
            <Link href="/sell-or-trade">Sell or Trade</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Decision Support</p>
              <h1>Compare Vehicle Options</h1>
              <p className="muted">
                Use this page to compare ownership path fit before moving into finance and checkout.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Body Style</strong>
                <span>SUV, Sedan, Truck, EV options</span>
              </article>
              <article>
                <strong>Budget</strong>
                <span>Down payment and term planning</span>
              </article>
              <article>
                <strong>Usage</strong>
                <span>Daily driving and mileage profile</span>
              </article>
            </div>
          </div>

          <div className="card-grid three-up" style={{ marginTop: '14px' }}>
            <article className="card">
              <h2>Urban Commute</h2>
              <p className="muted">Lower running cost, compact footprint, high parking convenience.</p>
            </article>
            <article className="card">
              <h2>Family Utility</h2>
              <p className="muted">Cargo, safety features, and comfort-first highway performance.</p>
            </article>
            <article className="card">
              <h2>Performance + Premium</h2>
              <p className="muted">Higher trim value, stronger feature stack, and premium ownership feel.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
