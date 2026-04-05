import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Planet Motors',
  description:
    'Contact Planet Motors sales and support team for inventory, trade-in, financing, and delivery questions.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
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
            <Link href="/contact" aria-current="page">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Support Team</p>
              <h1>Contact Planet Motors</h1>
              <p className="muted">
                Reach us for inventory questions, deal structuring, protection quotes, or delivery
                scheduling.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Sales</strong>
                <span>Inventory and purchase guidance</span>
              </article>
              <article>
                <strong>Finance</strong>
                <span>Application follow-up support</span>
              </article>
              <article>
                <strong>Ops</strong>
                <span>Delivery and post-sale updates</span>
              </article>
            </div>
          </div>

          <div className="card-grid split-grid" style={{ marginTop: '14px' }}>
            <article className="card">
              <h2>Primary Contact</h2>
              <p className="muted">Email: support@planetmotors.ca</p>
              <p className="muted">Phone: +1 (647) 555-0148</p>
              <p className="muted">Hours: Mon-Sat, 9:00 AM to 8:00 PM ET</p>
            </article>
            <article className="card">
              <h2>Fastest Path</h2>
              <p className="muted">
                For quickest response, start from the exact vehicle page and use finance/purchase
                or trade-in flow so our team sees full context immediately.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/inventory">
                  Browse Inventory
                </Link>
                <Link className="button button-secondary" href="/finance">
                  Apply for Finance
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
