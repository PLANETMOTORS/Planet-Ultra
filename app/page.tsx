import { VehicleImage } from '@/components/media/VehicleImage';
import { StructuredData } from '@/components/seo/StructuredData';
import { getFeaturedVehicles } from '@/lib/data/vehicleQueries';
import { buildHomeMetadata } from '@/lib/seo/metadata';
import { buildHomeJsonLd } from '@/lib/seo/schema';
import { cacheProfiles } from '@/lib/site/cache';
import { buildInventoryPath, buildVehicleCanonicalPath } from '@/lib/site/routes';

export const revalidate = cacheProfiles.home;

export const metadata = buildHomeMetadata();

export default function HomePage() {
  const featuredVehicles = getFeaturedVehicles();
  const heroVehicle = featuredVehicles[0];

  return (
    <main>
      <StructuredData data={buildHomeJsonLd()} id="home-structured-data" />

      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Planet Motors</div>
          <nav className="nav">
            <a href={buildInventoryPath()}>Shop Inventory</a>
            <a href="#sell-or-trade">Sell or Trade</a>
            <a href="#finance">Finance</a>
            <a href="#more">More</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-pills">
              <span className="pill">4.8 · 274+ Google Reviews</span>
              <span className="pill">OMVIC Registered Dealer</span>
            </div>
            <h1 className="hero-title">Buy, sell, or trade your next vehicle online.</h1>
            <p className="hero-copy">
              Browse server-rendered inventory pages, canonical vehicle detail pages, and
              fast-loading media built to keep search and performance surfaces stable.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={buildInventoryPath()}>
                Shop Inventory
              </a>
              <a className="button button-secondary" href="#sell-or-trade">
                Sell or Trade
              </a>
            </div>
          </div>

          <div className="hero-card">
            {heroVehicle ? (
              <VehicleImage
                image={heroVehicle.heroImage}
                alt={heroVehicle.heroImage.alt || 'Featured vehicle at Planet Motors'}
                className="hero-media"
                preload
                sizes="(max-width: 900px) 100vw, 40vw"
              />
            ) : (
              <div className="placeholder-media">Hero / vehicle visual placeholder</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Trust</p>
            <h2>Built for confidence</h2>
            <p className="muted">
              These are placeholder trust blocks for reviews, inspection, delivery, and dealer
              credibility.
            </p>
          </div>

          <div className="card-grid three-up">
            <article className="card">
              <h3>Google Reviews</h3>
              <p className="muted">Review badge area and reputation proof.</p>
            </article>
            <article className="card">
              <h3>Inspected Vehicles</h3>
              <p className="muted">Inspection summary and condition-report entry point.</p>
            </article>
            <article className="card">
              <h3>Ontario Dealer Trust</h3>
              <p className="muted">OMVIC and dealership trust messaging placeholder.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Inventory Preview</p>
            <h2>Featured vehicles</h2>
            <p className="muted">Static homepage shell with real canonical links into VDPs.</p>
          </div>

          <div className="card-grid three-up">
            {featuredVehicles.map((vehicle) => (
              <article className="card vehicle-card" key={vehicle.id}>
                <VehicleImage
                  image={vehicle.heroImage}
                  alt={vehicle.heroImage.alt || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="vehicle-card-media"
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
                <h3>{[vehicle.year, vehicle.make, vehicle.model].join(' ')}</h3>
                <p className="muted">
                  {vehicle.mileageKm.toLocaleString('en-CA')} km
                  {vehicle.drivetrain ? ` · ${vehicle.drivetrain}` : ''}
                  {vehicle.transmission ? ` · ${vehicle.transmission}` : ''}
                </p>
                <strong>${vehicle.priceCad.toLocaleString('en-CA')}</strong>
                <div className="card-actions">
                  <a className="button button-secondary" href={buildVehicleCanonicalPath(vehicle)}>
                    View vehicle
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="sell-or-trade">
        <div className="container split-grid">
          <article className="card">
            <p className="eyebrow">Sell or Trade</p>
            <h2>Get a real offer fast</h2>
            <p className="muted">
              Placeholder section for trade-in flow, plate/VIN entry, and instant appraisal steps.
            </p>
            <a className="button button-primary" href="#sell-or-trade">
              Start Trade-In
            </a>
          </article>

          <article className="card" id="finance">
            <p className="eyebrow">Finance</p>
            <h2>Flexible payment options</h2>
            <p className="muted">
              Placeholder section for finance calculator, approval steps, and payment confidence
              messaging.
            </p>
            <a className="button button-secondary" href="#finance">
              Explore Financing
            </a>
          </article>
        </div>
      </section>

      <footer className="footer" id="more">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Starter homepage shell for the Next.js rebuild.</p>
          </div>
          <div className="footer-links">
            <a href={buildInventoryPath()}>Inventory</a>
            <a href="#sell-or-trade">Sell or Trade</a>
            <a href="#finance">Finance</a>
            {heroVehicle ? (
              <a href={buildVehicleCanonicalPath(heroVehicle)}>Featured VDP</a>
            ) : (
              <a href={buildInventoryPath()}>Featured VDP</a>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
