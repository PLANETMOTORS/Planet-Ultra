import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Delivery & Pickup',
  description:
    'Learn how Planet Motors delivery and pickup works, including scheduling windows and lifecycle status updates.',
  alternates: { canonical: '/delivery' },
};

export default function DeliveryPage() {
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
            <Link href="/delivery" aria-current="page">
              Delivery
            </Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Operations</p>
              <h1>Delivery & Pickup</h1>
              <p className="muted">
                After checkout, choose delivery or pickup window and track status updates through
                lifecycle events.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Scheduled</strong>
                <span>Morning / afternoon / evening windows</span>
              </article>
              <article>
                <strong>Tracked</strong>
                <span>Confirmed to delivered status chain</span>
              </article>
              <article>
                <strong>Supported</strong>
                <span>Ops follow-up throughout handoff</span>
              </article>
            </div>
          </div>

          <article className="flow-card">
            <h2>Lifecycle Stages</h2>
            <div className="steps-list">
              <p>
                <strong>1.</strong> Scheduled
              </p>
              <p>
                <strong>2.</strong> Confirmed
              </p>
              <p>
                <strong>3.</strong> In transit
              </p>
              <p>
                <strong>4.</strong> Delivered
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
