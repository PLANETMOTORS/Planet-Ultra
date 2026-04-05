import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { getInventoryCards } from '@/lib/inventory/repository';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.planetmotors.ca';

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

type HomeFeaturedCard = {
  key: string;
  title: string;
  meta: string;
  price: number;
  href: string;
  imageUrl?: string;
};

function fallbackFeaturedCards(): HomeFeaturedCard[] {
  return [
    {
      key: 'fallback-bmw-x3',
      title: '2022 BMW X3 xDrive30i',
      meta: '52,890 km · AWD · Auto',
      price: 42995,
      href: '/inventory',
    },
    {
      key: 'fallback-model-3',
      title: '2021 Tesla Model 3 Long Range',
      meta: '36,220 km · EV · AWD',
      price: 47500,
      href: '/inventory',
    },
    {
      key: 'fallback-audi-q5',
      title: '2023 Audi Q5 Progressiv',
      meta: '19,370 km · Quattro · Auto',
      price: 53900,
      href: '/inventory',
    },
  ];
}

function formatPriceCad(value: number): string {
  return `$${value.toLocaleString('en-CA')}`;
}

export default async function HomePage() {
  const liveCards = await getInventoryCards(3);
  const featuredCards: HomeFeaturedCard[] =
    liveCards.length > 0
      ? liveCards.map(({ vehicle, canonicalPath }) => ({
          key: vehicle.vin,
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
          meta: `${vehicle.mileageKm.toLocaleString('en-CA')} km · ${vehicle.drivetrain || 'AWD/2WD'} · ${vehicle.transmission || 'Auto'}`,
          price: vehicle.salePriceCad ?? vehicle.priceCad,
          href: canonicalPath,
          imageUrl: vehicle.heroImage?.url,
        }))
      : fallbackFeaturedCards();
  const primaryVdpHref = featuredCards[0]?.href || '/inventory';

  return (
    <main>
      <JsonLd data={autoDealerJsonLd} />

      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
            <a href="/protection">Protection</a>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container home-hero">
          <div>
            <p className="hero-kicker">Planet Motors Digital Retail</p>
            <h1 className="home-hero-title">
              Find, Finance, and Drive the Right Car in Days, Not Weeks.
            </h1>
            <p className="home-hero-copy">
              Live inventory, transparent pricing, and delivery-ready checkout flow designed for
              high conversion and trust.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/inventory">
                Shop Inventory
              </Link>
              <Link className="button button-secondary" href="/finance">
                Get Pre-Approved
              </Link>
            </div>
          </div>

          <div className="hero-kpi-stack">
            <article className="hero-kpi-card">
              <strong>{liveCards.length > 0 ? `${liveCards.length * 162}` : '486'}</strong>
              <span>Vehicles Live Now</span>
            </article>
            <article className="hero-kpi-card">
              <strong>24h</strong>
              <span>Fresh Inventory Sync</span>
            </article>
            <article className="hero-kpi-card">
              <strong>10-Day</strong>
              <span>Money-Back Promise</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="trust-strip" role="list" aria-label="Trust highlights">
            <div className="trust-pill" role="listitem">
              210-Point Inspection
            </div>
            <div className="trust-pill" role="listitem">
              CARFAX Transparency
            </div>
            <div className="trust-pill" role="listitem">
              Home Delivery & Pickup
            </div>
            <div className="trust-pill" role="listitem">
              Secure Online Deposit
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container home-grid">
          <div>
            <div className="section-heading">
              <p className="eyebrow">Featured Inventory</p>
              <h2>Available Right Now</h2>
              <p className="muted">
                Inventory cards pull from the active snapshot and route directly to canonical VDP
                pages.
              </p>
            </div>

            <div className="home-card-grid">
              {featuredCards.map((item) => (
                <article className="home-vehicle-card" key={item.key}>
                  <Link href={item.href} aria-label={`View ${item.title}`}>
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="home-vehicle-image"
                        width={900}
                        height={560}
                      />
                    ) : (
                      <div className="home-vehicle-image home-vehicle-image-fallback">Vehicle Photo</div>
                    )}
                  </Link>
                  <div className="home-vehicle-body">
                    <h3>{item.title}</h3>
                    <p>{item.meta}</p>
                    <div className="home-vehicle-price-row">
                      <strong>{formatPriceCad(item.price)}</strong>
                      <Link href={item.href}>View Details</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="steps-card">
            <h3>How It Works</h3>
            <div className="steps-list">
              <p>
                <strong>1.</strong> Choose from live inventory
              </p>
              <p>
                <strong>2.</strong> Reserve or finance online
              </p>
              <p>
                <strong>3.</strong> Pickup or delivery scheduling
              </p>
              <p>
                <strong>4.</strong> 10-day return confidence
              </p>
            </div>
            <Link className="button button-primary" href={primaryVdpHref}>
              View VDP Experience
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container promo-grid">
          <article className="promo-card">
            <p className="eyebrow">Sell or Trade</p>
            <h2>Get a Real Offer Fast</h2>
            <p className="muted">Start with VIN or plate. Offer workflow is connected to trade-in lifecycle APIs.</p>
            <Link className="button button-primary" href="/sell-or-trade">
              Start Trade-In
            </Link>
          </article>

          <article className="promo-card">
            <p className="eyebrow">Finance</p>
            <h2>Flexible Payment Options</h2>
            <p className="muted">Pre-qualification and lender dispatch are ready for dealer-integrated runtime evidence.</p>
            <Link className="button button-secondary" href="/finance">
              Explore Financing
            </Link>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Conversion-first homepage shell with dynamic inventory and trust rails.</p>
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
