import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.planetmotors.app';

export const metadata: Metadata = {
  title: 'Buy, Sell & Trade Vehicles Online',
  description:
    'Planet Motors is an OMVIC registered dealer in Ontario. Browse quality used vehicles, get a fast trade-in offer, and apply for financing online.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Planet Motors – Buy, Sell & Trade Vehicles Online',
    description:
      'OMVIC registered Ontario dealer. Quality used vehicles, transparent pricing, fast trade-in appraisals, and flexible financing.',
    type: 'website',
    url: '/',
  },
};

const autoDealerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'Planet Motors',
  url: SITE_URL,
  description:
    'Planet Motors is an OMVIC registered used vehicle dealer in Ontario offering quality pre-owned vehicles, trade-in appraisals, and financing.',
  areaServed: {
    '@type': 'Province',
    name: 'Ontario',
    addressCountry: 'CA',
  },
  sameAs: [],
};

export default function HomePage() {
  return (
    <main>
      <JsonLd data={autoDealerJsonLd} />

      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Planet Motors</div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
            <a href="#">More</a>
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
              This is the first UI shell for Planet Motors. Final data, finance logic, and live inventory
              will be connected after the structure is locked.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/inventory">
                Shop Inventory
              </Link>
              <a className="button button-secondary" href="/sell-or-trade">
                Sell or Trade
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="placeholder-media">Hero / vehicle visual placeholder</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Trust</p>
            <h2>Built for confidence</h2>
            <p className="muted">
              These are placeholder trust blocks for reviews, inspection, delivery, and dealer credibility.
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
            <p className="muted">Static card placeholders for the first homepage shell.</p>
          </div>

          <div className="card-grid three-up">
            <article className="card vehicle-card">
              <div className="placeholder-media small">Vehicle Image</div>
              <h3>2021 BMW X3</h3>
              <p className="muted">58,000 km · AWD · Auto</p>
              <strong>$34,995</strong>
            </article>
            <article className="card vehicle-card">
              <div className="placeholder-media small">Vehicle Image</div>
              <h3>2020 Audi Q5</h3>
              <p className="muted">63,000 km · Quattro · Auto</p>
              <strong>$31,995</strong>
            </article>
            <article className="card vehicle-card">
              <div className="placeholder-media small">Vehicle Image</div>
              <h3>2022 Tesla Model 3</h3>
              <p className="muted">29,000 km · EV · Auto</p>
              <strong>$39,995</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <article className="card">
            <p className="eyebrow">Sell or Trade</p>
            <h2>Get a real offer fast</h2>
            <p className="muted">
              Placeholder section for trade-in flow, plate/VIN entry, and instant appraisal steps.
            </p>
            <a className="button button-primary" href="/sell-or-trade">
              Start Trade-In
            </a>
          </article>

          <article className="card">
            <p className="eyebrow">Finance</p>
            <h2>Flexible payment options</h2>
            <p className="muted">
              Placeholder section for finance calculator, approval steps, and payment confidence messaging.
            </p>
            <a className="button button-secondary" href="/finance">
              Explore Financing
            </a>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Starter homepage shell for the Next.js rebuild.</p>
          </div>
          <div className="footer-links">
            <Link href="/inventory">Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
