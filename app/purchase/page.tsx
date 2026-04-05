import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import PurchaseFlowClient from '@/components/purchase/PurchaseFlowClient';

/**
 * /purchase — public shell, auth-aware. Server Component.
 *
 * Accepts vehicle context via search params from the VDP CTA.
 * The deposit Stripe session is created via /api/purchase/submit (server boundary).
 * No Stripe keys or payment logic are ever in this component.
 */
export const metadata: Metadata = {
  title: 'Start Purchase',
  description: 'Secure your vehicle with a refundable deposit at Planet Motors.',
  robots: { index: false, follow: false },
};

export default function PurchasePage() {
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
            <Link href="/purchase" aria-current="page">
              Purchase
            </Link>
          </nav>
        </div>
      </header>

      <section className="section purchase-flow">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Secure Checkout Flow</p>
              <h1>Start Purchase</h1>
              <p className="muted">
                Reserve your vehicle with a secure refundable deposit. Checkout creation is handled
                server-side with Stripe session safety and lifecycle logging.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Auth</strong>
                <span>Clerk-protected checkout creation</span>
              </article>
              <article>
                <strong>Stripe</strong>
                <span>Server-only secret key handling</span>
              </article>
              <article>
                <strong>10-Day</strong>
                <span>Return/refund lifecycle supported</span>
              </article>
            </div>
          </div>

          <Suspense
            fallback={
              <article className="flow-card">
                <h2>Loading Purchase Context…</h2>
                <p className="muted">
                  Preparing your checkout details. If this takes a moment, continue browsing inventory.
                </p>
              </article>
            }
          >
            <PurchaseFlowClient />
          </Suspense>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Purchase flow shell with auth-aware checkout states.</p>
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
