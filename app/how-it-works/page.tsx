import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'See how Planet Motors handles shopping, financing, trade-ins, and delivery in a clear step-by-step flow.',
  alternates: { canonical: '/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <Link href="/sell-or-trade">Sell or Trade</Link>
            <Link href="/finance">Finance</Link>
            <Link href="/how-it-works" aria-current="page">
              How It Works
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Digital Retail Process</p>
              <h1>How It Works</h1>
              <p className="muted">
                Planet Motors is built around transparent lifecycle steps from first click to
                delivery and support.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>4 Steps</strong>
                <span>From browse to delivery</span>
              </article>
              <article>
                <strong>1 Platform</strong>
                <span>Inventory, trade-in, finance, checkout</span>
              </article>
              <article>
                <strong>10-Day</strong>
                <span>Return confidence window</span>
              </article>
            </div>
          </div>

          <div className="card-grid three-up" style={{ marginTop: '14px' }}>
            <article className="card">
              <p className="eyebrow">Step 1</p>
              <h2>Shop Live Inventory</h2>
              <p className="muted">
                Browse real-time inventory cards and open canonical VDP pages with specs, photos,
                and transparent pricing.
              </p>
            </article>
            <article className="card">
              <p className="eyebrow">Step 2</p>
              <h2>Trade-In + Finance</h2>
              <p className="muted">
                Request instant trade-in estimates and submit finance details through protected
                server boundaries.
              </p>
            </article>
            <article className="card">
              <p className="eyebrow">Step 3</p>
              <h2>Secure Checkout</h2>
              <p className="muted">
                Reserve online with secure deposit checkout, then move into delivery scheduling and
                lifecycle tracking.
              </p>
            </article>
          </div>

          <article className="flow-card">
            <h3>Need Help Choosing?</h3>
            <p className="muted">
              Start with inventory, then compare financing and trade-in values side by side before
              finalizing your purchase path.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/inventory">
                Shop Inventory
              </Link>
              <Link className="button button-secondary" href="/sell-or-trade">
                Start Trade-In
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
