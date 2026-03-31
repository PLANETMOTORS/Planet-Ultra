import type { Metadata } from 'next';
import Link from 'next/link';
import { getInventoryCards } from '@/lib/inventory/repository';

/**
 * Inventory listing page.
 * Revalidates every 5 minutes — vehicle availability changes frequently.
 * Data will be populated in a later phase from Postgres.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Used Vehicle Inventory',
  description:
    'Browse quality used vehicles at Planet Motors. OMVIC registered dealer in Ontario with transparent pricing, vehicle history, and financing options.',
  alternates: {
    canonical: '/inventory',
  },
  openGraph: {
    title: 'Used Vehicle Inventory | Planet Motors',
    description:
      'Browse quality used vehicles at Planet Motors. OMVIC registered dealer in Ontario.',
    type: 'website',
  },
};

export default async function InventoryPage() {
  const cards = await getInventoryCards(120);

  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory" aria-current="page">
              Shop Inventory
            </Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h1>Used Vehicle Inventory</h1>
            <p className="muted">
              Quality used vehicles from an OMVIC registered Ontario dealer.
            </p>
          </div>
          <div className="card-grid three-up" aria-label="Vehicle inventory">
            {cards.length === 0 ? (
              <p className="muted">No inventory found. Run the HomeNet import to load vehicles.</p>
            ) : (
              cards.map(({ vehicle, canonicalPath }) => (
                <article className="card vehicle-card" key={vehicle.vin}>
                  <h3>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="muted">{vehicle.trim || 'Trim not listed'}</p>
                  <p>
                    <strong>${vehicle.priceCad.toLocaleString('en-CA')}</strong>
                  </p>
                  <p className="muted">{vehicle.mileageKm.toLocaleString('en-CA')} km</p>
                  <Link className="button button-secondary" href={canonicalPath}>
                    View Details
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
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
