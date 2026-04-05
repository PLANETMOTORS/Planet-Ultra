import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Planet Motors',
  description:
    'Learn about Planet Motors, our trust model, and our approach to transparent digital vehicle retail in Ontario.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
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
            <Link href="/about" aria-current="page">
              About
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Our Mission</p>
              <h1>About Planet Motors</h1>
              <p className="muted">
                We are building a conversion-first, trust-first digital retail platform for vehicle
                buyers across Ontario.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>OMVIC</strong>
                <span>Ontario dealer standards</span>
              </article>
              <article>
                <strong>Secure</strong>
                <span>Server-side checkout + webhooks</span>
              </article>
              <article>
                <strong>Transparent</strong>
                <span>Lifecycle-backed operations</span>
              </article>
            </div>
          </div>

          <div className="card-grid split-grid" style={{ marginTop: '14px' }}>
            <article className="card">
              <h2>What Makes Us Different</h2>
              <p className="muted">
                We combine live inventory data, finance boundaries, trade-in lifecycle controls, and
                conversion-focused design into one operating platform.
              </p>
            </article>
            <article className="card">
              <h2>How We Build Trust</h2>
              <p className="muted">
                CARFAX transparency, structured vehicle detail pages, secure payments, and clear
                support channels at every decision point.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
