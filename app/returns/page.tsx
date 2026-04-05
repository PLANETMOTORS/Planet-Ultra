import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '10-Day Return Policy',
  description:
    'Planet Motors 10-day return workflow, eligibility rules, and refund lifecycle overview.',
  alternates: { canonical: '/returns' },
};

export default function ReturnsPage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <Link href="/purchase">Purchase</Link>
            <Link href="/returns" aria-current="page">
              Returns
            </Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Policy</p>
              <h1>10-Day Return Policy</h1>
              <p className="muted">
                If your purchase does not fit your needs, return initiation and refund lifecycle are
                managed through secure server boundaries.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>10 Days</strong>
                <span>Return request window</span>
              </article>
              <article>
                <strong>Tracked</strong>
                <span>Return and refund state events</span>
              </article>
              <article>
                <strong>Transparent</strong>
                <span>Clear eligibility and status updates</span>
              </article>
            </div>
          </div>

          <article className="flow-card">
            <h2>Return Flow</h2>
            <ol className="flow-steps-list">
              <li>Initiate return within policy window.</li>
              <li>Vehicle inspection and validation.</li>
              <li>Refund pending status set.</li>
              <li>Refund settled and confirmation sent.</li>
            </ol>
            <div className="hero-actions">
              <Link className="button button-primary" href="/contact">
                Contact Support
              </Link>
              <Link className="button button-secondary" href="/inventory">
                Browse Inventory
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
