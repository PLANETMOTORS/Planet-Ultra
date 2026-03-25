import type { Metadata } from 'next';
import Link from 'next/link';
import type { Vehicle } from '@/types/vehicle';
import { buildVehicleMetadata } from '@/lib/seo/buildVehicleMetadata';
import { buildVehicleJsonLd } from '@/lib/seo/buildVehicleJsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo/buildBreadcrumbJsonLd';
import { buildCanonicalVdpPath } from '@/lib/seo/urlUtils';
import { has360Asset, get360PosterUrl } from '@/lib/media/360';
import JsonLd from '@/components/JsonLd';

/**
 * Canonical VDP route: /inventory/used/[make]/[model]/[slug]
 *
 * Data source: Postgres (rendering truth for all vehicle facts).
 * Media source: Cloudinary (frontend media truth).
 * Revalidates every 5 minutes; stale-while-revalidate pattern.
 *
 * 360 is poster-first and click-to-hydrate — never part of the critical path.
 */
export const revalidate = 300;

interface VdpParams {
  make: string;
  model: string;
  slug: string;
}

/**
 * Fetches a vehicle from Postgres by slug.
 * Returns null if not found.
 *
 * NOTE: This stub will be replaced with a real Postgres query in a later phase.
 * The function signature and null-return contract must be preserved.
 */
async function getVehicleBySlug(_slug: string): Promise<Vehicle | null> {
  // TODO: replace with real Postgres query via the data layer.
  //
  // DEV FIXTURE — returns a representative vehicle for any slug so that
  // generateMetadata exercises the full metadata path including the
  // socialCardImageUrl() Cloudinary transform. This fixture is intentionally
  // realistic: it uses a /upload/ Cloudinary URL so the transform fires.
  // Remove or gate behind NODE_ENV==='development' once Postgres is wired.
  return {
    id: 'fixture-001',
    slug: _slug,
    vin: '5UXWX9C56F0D12345',
    stockNumber: 'PM-1001',
    year: 2021,
    make: 'BMW',
    model: 'X3',
    trim: 'xDrive30i',
    bodyStyle: 'SUV',
    drivetrain: 'AWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    mileageKm: 58000,
    exteriorColor: 'Alpine White',
    interiorColor: 'Black',
    priceCad: 34995,
    status: 'available',
    isFeatured: true,
    isCertified: false,
    heroImage: {
      url: 'https://res.cloudinary.com/planet-motors/image/upload/v1700000000/vehicles/bmw-x3-fixture-hero.jpg',
      alt: '2021 BMW X3 xDrive30i — Alpine White',
      width: 1920,
      height: 1280,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<VdpParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found',
      robots: { index: false, follow: false },
    };
  }

  return buildVehicleMetadata(vehicle);
}

export default async function VdpPage({
  params,
}: {
  params: Promise<VdpParams>;
}) {
  const { make, model, slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return (
      <main>
        <div className="container section">
          <h1>Vehicle Not Found</h1>
          <p className="muted">This vehicle may have been sold or is no longer available.</p>
          <Link className="button button-primary" href="/inventory">
            Browse Inventory
          </Link>
        </div>
      </main>
    );
  }

  const canonicalPath = buildCanonicalVdpPath(make, model, slug);
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: vehicleName, path: canonicalPath },
  ]);

  const vehicleJsonLd = buildVehicleJsonLd(vehicle);

  const show360 = has360Asset(vehicle.hero360Asset);
  const poster360Url = show360 ? get360PosterUrl(vehicle.hero360Asset!) : undefined;

  return (
    <main>
      <JsonLd data={[vehicleJsonLd, breadcrumb]} />

      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', padding: 0, margin: '0 0 16px', flexWrap: 'wrap' }}>
              <li><Link href="/">Home</Link></li>
              <li aria-hidden="true"> / </li>
              <li><Link href="/inventory">Inventory</Link></li>
              <li aria-hidden="true"> / </li>
              <li aria-current="page">{vehicleName}</li>
            </ol>
          </nav>

          <h1>{vehicleName}</h1>

          {/*
            Hero media — LCP candidate.
            Rendered as a standard image block.
            If a 360 asset exists it is rendered poster-first, isolated below.
          */}
          {vehicle.heroImage?.url && (
            <div
              style={{
                aspectRatio: '3/2',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '24px',
              }}
            >
              {/*
                NOTE: Use next/image with width/height once Cloudinary transforms are
                confirmed. Explicit dimensions are required to prevent CLS.
                width={1200} height={800} will be set in a later phase.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vehicle.heroImage.url}
                alt={vehicle.heroImage.alt || vehicleName}
                width={1200}
                height={800}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          )}

          {/*
            360 viewer — fully isolated from critical render path.
            Poster shown immediately. Viewer JS loads only on user interaction.
            The viewer component itself will use dynamic import() in a later phase.
          */}
          {show360 && poster360Url && (
            <div
              data-testid="360-poster"
              style={{
                aspectRatio: '3/2',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '24px',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster360Url}
                alt={`${vehicleName} 360 view`}
                width={1200}
                height={800}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <button
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    color: '#0b0d10',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  aria-label="Launch 360 degree view"
                >
                  View 360°
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: '24px' }}>
            <h2>Vehicle Details</h2>
            <dl className="spec-list">
              <div className="spec-row">
                <dt>Year</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div className="spec-row">
                <dt>Make</dt>
                <dd>{vehicle.make}</dd>
              </div>
              <div className="spec-row">
                <dt>Model</dt>
                <dd>{vehicle.model}</dd>
              </div>
              {vehicle.trim && (
                <div className="spec-row">
                  <dt>Trim</dt>
                  <dd>{vehicle.trim}</dd>
                </div>
              )}
              <div className="spec-row">
                <dt>Mileage</dt>
                <dd>{vehicle.mileageKm.toLocaleString()} km</dd>
              </div>
              {vehicle.bodyStyle && (
                <div className="spec-row">
                  <dt>Body Style</dt>
                  <dd>{vehicle.bodyStyle}</dd>
                </div>
              )}
              {vehicle.drivetrain && (
                <div className="spec-row">
                  <dt>Drivetrain</dt>
                  <dd>{vehicle.drivetrain}</dd>
                </div>
              )}
              {vehicle.fuelType && (
                <div className="spec-row">
                  <dt>Fuel Type</dt>
                  <dd>{vehicle.fuelType}</dd>
                </div>
              )}
              {vehicle.transmission && (
                <div className="spec-row">
                  <dt>Transmission</dt>
                  <dd>{vehicle.transmission}</dd>
                </div>
              )}
              {vehicle.exteriorColor && (
                <div className="spec-row">
                  <dt>Exterior Colour</dt>
                  <dd>{vehicle.exteriorColor}</dd>
                </div>
              )}
              {vehicle.interiorColor && (
                <div className="spec-row">
                  <dt>Interior Colour</dt>
                  <dd>{vehicle.interiorColor}</dd>
                </div>
              )}
              <div className="spec-row">
                <dt>VIN</dt>
                <dd>{vehicle.vin}</dd>
              </div>
              <div className="spec-row">
                <dt>Stock #</dt>
                <dd>{vehicle.stockNumber}</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h2>
              {vehicle.salePriceCad
                ? `$${vehicle.salePriceCad.toLocaleString()}`
                : `$${vehicle.priceCad.toLocaleString()}`}
            </h2>
            {vehicle.salePriceCad && (
              <p className="muted" style={{ textDecoration: 'line-through' }}>
                Was ${vehicle.priceCad.toLocaleString()}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <a className="button button-primary" href="/finance">
                Apply for Financing
              </a>
              <a className="button button-secondary" href="/sell-or-trade">
                Trade In Your Vehicle
              </a>
            </div>
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
