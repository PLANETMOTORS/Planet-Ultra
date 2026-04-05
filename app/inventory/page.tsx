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
  const availableCount = cards.length;

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
            <a href="/protection">Protection</a>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="inventory-hero">
            <div>
              <p className="eyebrow">Live Inventory</p>
              <h1>Used Vehicle Inventory</h1>
              <p className="muted">
                Live vehicle cards sourced from the latest HomeNet snapshot with canonical VDP
                routing.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/finance">
                  Get Pre-Approved
                </Link>
                <Link className="button button-secondary" href="/sell-or-trade">
                  Start Trade-In
                </Link>
              </div>
            </div>
            <div className="inventory-kpi">
              <article>
                <strong>{availableCount}</strong>
                <span>Vehicles available now</span>
              </article>
              <article>
                <strong>5m</strong>
                <span>Revalidation cadence</span>
              </article>
              <article>
                <strong>100%</strong>
                <span>Canonical VDP routing</span>
              </article>
            </div>
          </div>

          <div className="inventory-grid" aria-label="Vehicle inventory">
            {cards.length === 0 ? (
              <article className="inventory-empty">
                <h2>No Inventory Loaded Yet</h2>
                <p className="muted">
                  Run the HomeNet importer to load the latest snapshot and refresh this listing.
                </p>
                <code>npm run inventory:import:homenet:file -- &quot;/absolute/path/feed.csv&quot;</code>
              </article>
            ) : (
              cards.map(({ vehicle, canonicalPath }) => (
                <article className="inventory-card" key={vehicle.vin}>
                  <Link href={canonicalPath} aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}>
                    {vehicle.heroImage?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.heroImage.url}
                        alt={vehicle.heroImage.alt || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="inventory-card-image"
                        width={900}
                        height={560}
                      />
                    ) : (
                      <div className="inventory-card-image inventory-card-fallback">Vehicle Photo</div>
                    )}
                  </Link>
                  <div className="inventory-card-body">
                    <h3>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p>{vehicle.trim || 'Trim not listed'}</p>
                    <div className="inventory-tags">
                      <span>{vehicle.mileageKm.toLocaleString('en-CA')} km</span>
                      <span>{vehicle.drivetrain || 'AWD/2WD'}</span>
                      <span>{vehicle.transmission || 'Auto'}</span>
                    </div>
                    <div className="inventory-card-footer">
                      <strong>${(vehicle.salePriceCad ?? vehicle.priceCad).toLocaleString('en-CA')}</strong>
                      <Link href={canonicalPath}>View Details</Link>
                    </div>
                  </div>
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
