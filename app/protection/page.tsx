import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ProtectionRuntimePanel from '@/components/protection/ProtectionRuntimePanel';

/**
 * /protection — public shell. Server Component.
 *
 * F&I protection products (extended warranty, GAP, etc.).
 * Quote requests go to /api/protection/quote (stub in current phase).
 */

export const metadata: Metadata = {
  title: 'Vehicle Protection',
  description:
    'Explore protection plans for your vehicle at Planet Motors. Extended warranty, GAP coverage, and more.',
  alternates: { canonical: '/protection' },
};

export default function ProtectionPage() {
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
            <a href="/finance">Finance</a>
            <Link href="/protection" aria-current="page">
              Protection
            </Link>
          </nav>
        </div>
      </header>

      <section className="section protection-flow">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Protection Plans</p>
              <h1>Vehicle Protection</h1>
              <p className="muted">
                Extended coverage options designed for confidence after purchase. Quote flow is
                wired to the server boundary route.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>3 Tiers</strong>
                <span>Essential, Comprehensive, Ultimate</span>
              </article>
              <article>
                <strong>Coverage</strong>
                <span>Mechanical + roadside options</span>
              </article>
              <article>
                <strong>Server</strong>
                <span>Quote boundary via /api/protection/quote</span>
              </article>
            </div>
          </div>

          <div className="protection-grid">
            <article className="protection-plan-card">
              <h3>Essential</h3>
              <p className="muted">Included baseline coverage for core components.</p>
              <ul>
                <li>Powertrain core components</li>
                <li>Basic roadside support</li>
                <li>Short-term protection period</li>
              </ul>
            </article>

            <article className="protection-plan-card">
              <h3>Comprehensive</h3>
              <p className="muted">Balanced plan for broader ownership confidence.</p>
              <ul>
                <li>Expanded electrical/mechanical coverage</li>
                <li>Towing and rental allowances</li>
                <li>Longer term + higher km limit</li>
              </ul>
            </article>

            <article className="protection-plan-card">
              <h3>Ultimate</h3>
              <p className="muted">Maximum coverage and premium support add-ons.</p>
              <ul>
                <li>Highest component coverage depth</li>
                <li>Priority claim support</li>
                <li>Top-term and top-km protection window</li>
              </ul>
            </article>
          </div>

          <Suspense
            fallback={
              <article className="flow-card">
                <h2>Loading Protection Context...</h2>
                <p className="muted">Preparing your quote flow.</p>
              </article>
            }
          >
            <ProtectionRuntimePanel />
          </Suspense>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Protection product shell aligned with finance and purchase flows.</p>
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
