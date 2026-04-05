import type { Metadata } from 'next';
import Link from 'next/link';
import TradeInLeadFlow from '@/components/tradein/TradeInLeadFlow';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sell or Trade Your Vehicle',
  description:
    'Get a fast trade-in offer from Planet Motors. Enter your vehicle details, receive an instant estimate, and schedule pickup.',
  alternates: { canonical: '/sell-or-trade' },
};

export default function SellOrTradePage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <Link href="/sell-or-trade" aria-current="page">
              Sell or Trade
            </Link>
            <a href="/finance">Finance</a>
            <a href="/protection">Protection</a>
          </nav>
        </div>
      </header>

      <section className="section sell-flow">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Trade-In Conversion Flow</p>
              <h1>Sell or Trade Your Vehicle</h1>
              <p className="muted">
                Enter your details in under two minutes and get a fast estimate. If you like the
                offer, schedule pickup and continue into purchase or finance.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>2 min</strong>
                <span>Offer request experience</span>
              </article>
              <article>
                <strong>7 days</strong>
                <span>Offer lock window</span>
              </article>
              <article>
                <strong>Live</strong>
                <span>Backed by trade-in lifecycle APIs</span>
              </article>
            </div>
          </div>

          <div className="flow-grid">
            <TradeInLeadFlow />

            <aside className="flow-card flow-steps">
              <h3>How It Works</h3>
              <ol>
                <li>Submit your vehicle details for an instant estimate.</li>
                <li>Receive a 7-day offer hold with submission reference.</li>
                <li>Sign in to accept and lock pickup date and window.</li>
                <li>Track lifecycle status through our trade-in pipeline.</li>
              </ol>
              <Link className="button button-secondary" href="/inventory">
                Browse Inventory
              </Link>
            </aside>
          </div>

          <article className="flow-card sell-api-card">
            <h2>Runtime API Boundaries</h2>
            <p className="muted">
              This page is wired to production-safe server boundaries with validation, rate limits,
              and lifecycle state transitions.
            </p>
            <div className="sell-api-chip-row" aria-label="Trade-in API routes">
              <code>POST /api/trade-in/offer</code>
              <code>POST /api/trade-in/accept</code>
              <code>GET /api/trade-in/status</code>
              <code>POST /api/webhooks/tradein</code>
            </div>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Trade-in flow with instant estimate and pickup lifecycle shell.</p>
          </div>
          <div className="footer-links">
            <Link href="/inventory">Inventory</Link>
            <Link href="/sell-or-trade">Sell or Trade</Link>
            <a href="/finance">Finance</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
