import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import FinanceRuntimePanel from '@/components/finance/FinanceRuntimePanel';

/**
 * /finance — public. Server Component.
 *
 * Accepts optional vehicle context via search params (from VDP CTA).
 * Pre-fills vehicle info from params — no business logic in UI.
 * Finance submission goes to /api/finance/submit (server boundary).
 */
export const metadata: Metadata = {
  title: 'Apply for Financing',
  description:
    'Apply for vehicle financing at Planet Motors. Quick online application — our finance team will contact you.',
  alternates: { canonical: '/finance' },
};

export default function FinancePage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <Link href="/finance" aria-current="page">
              Finance
            </Link>
            <a href="/protection">Protection</a>
          </nav>
        </div>
      </header>

      <section className="section finance-flow">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Finance Application</p>
              <h1>Apply for Financing</h1>
              <p className="muted">
                Fast online application with lender relay-ready backend. Our team follows up within
                one business day.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>5 min</strong>
                <span>Average application time</span>
              </article>
              <article>
                <strong>Secure</strong>
                <span>Server-side validation + rate limits</span>
              </article>
              <article>
                <strong>Live</strong>
                <span>Dealertrack/RouteOne lifecycle wiring</span>
              </article>
            </div>
          </div>

          <Suspense
            fallback={
              <article className="flow-card">
                <h2>Loading Finance Context...</h2>
                <p className="muted">Preparing your application flow.</p>
              </article>
            }
          >
            <FinanceRuntimePanel />
          </Suspense>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Finance conversion flow shell with runtime-safe boundaries.</p>
          </div>
          <div className="footer-links">
            <Link href="/inventory">Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <Link href="/finance">Finance</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
