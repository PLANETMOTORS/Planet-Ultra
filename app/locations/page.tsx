import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Locations',
  description:
    'Explore Planet Motors service regions, delivery coverage, and in-person support locations.',
  alternates: { canonical: '/locations' },
};

const locations = [
  {
    name: 'Greater Toronto Area',
    detail: 'Primary delivery and pickup region with full inventory support.',
  },
  {
    name: 'Hamilton / Niagara',
    detail: 'Scheduled delivery windows and trade-in pickup routing.',
  },
  {
    name: 'Kitchener / Waterloo',
    detail: 'Expanded coverage for checkout, financing, and post-sale support.',
  },
];

export default function LocationsPage() {
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
            <Link href="/locations" aria-current="page">
              Locations
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Coverage</p>
              <h1>Locations & Delivery Regions</h1>
              <p className="muted">
                Service regions are mapped into our lifecycle for delivery scheduling, support, and
                trade-in pickup planning.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Ontario</strong>
                <span>Primary operating region</span>
              </article>
              <article>
                <strong>Pickup</strong>
                <span>Trade-in slot scheduling support</span>
              </article>
              <article>
                <strong>Delivery</strong>
                <span>Lifecycle event-driven tracking</span>
              </article>
            </div>
          </div>

          <div className="card-grid three-up" style={{ marginTop: '14px' }}>
            {locations.map((item) => (
              <article className="card" key={item.name}>
                <h2>{item.name}</h2>
                <p className="muted">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
