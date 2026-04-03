import type { Metadata } from 'next';
import Link from 'next/link';
import type { Vehicle } from '@/types/vehicle';
import { buildVehicleMetadata } from '@/lib/seo/buildVehicleMetadata';
import { buildVehicleJsonLd } from '@/lib/seo/buildVehicleJsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo/buildBreadcrumbJsonLd';
import { buildCanonicalVdpPath } from '@/lib/seo/urlUtils';
import { has360Asset, get360PosterUrl } from '@/lib/media/360';
import JsonLd from '@/components/JsonLd';
import { getInventoryVehicleBySlug } from '@/lib/inventory/repository';

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
  return getInventoryVehicleBySlug(_slug);
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
  const displayPrice = vehicle.salePriceCad ?? vehicle.priceCad;
  const estimatedMonthly = Math.round(displayPrice / 72);

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

      <section className="section vdp-page">
        <div className="container">
          <nav aria-label="Breadcrumb" className="vdp-breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/inventory">Inventory</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{vehicleName}</li>
            </ol>
          </nav>

          <h1 className="vdp-title">{vehicleName}</h1>

          <div className="vdp-shell">
            <article className="vdp-gallery">
              <div className="vdp-media-stage">
                {vehicle.heroImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vehicle.heroImage.url}
                    alt={vehicle.heroImage.alt || vehicleName}
                    width={1200}
                    height={800}
                    className="vdp-media-image"
                  />
                ) : (
                  <div className="vdp-media-image vdp-media-fallback">Vehicle Photo</div>
                )}

                {show360 && poster360Url && (
                  <div className="vdp-360-overlay" data-testid="360-poster">
                    <button className="vdp-360-button" aria-label="Launch 360 degree view">
                      View 360°
                    </button>
                  </div>
                )}
              </div>

              <div className="vdp-thumbs" aria-hidden="true">
                {vehicle.galleryImages && vehicle.galleryImages.length > 0
                  ? vehicle.galleryImages.slice(0, 5).map((img, idx) => (
                      <div key={`${img.url}-${idx}`} className="vdp-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.alt || `${vehicleName} photo ${idx + 1}`} />
                      </div>
                    ))
                  : Array.from({ length: 5 }).map((_, idx) => (
                      <div className="vdp-thumb vdp-thumb-fallback" key={`thumb-${idx}`} />
                    ))}
              </div>
            </article>

            <aside className="vdp-panel">
              <p className="eyebrow">{vehicle.year} {vehicle.make} {vehicle.model}</p>
              <div className="vdp-price">${displayPrice.toLocaleString('en-CA')}</div>
              {vehicle.salePriceCad && (
                <p className="vdp-price-note">Was ${vehicle.priceCad.toLocaleString('en-CA')}</p>
              )}
              <p className="vdp-price-subtle">Estimated ${estimatedMonthly.toLocaleString('en-CA')}/mo · 72 months</p>

              <div className="vdp-spec-grid">
                <div className="vdp-spec-tile">
                  <span>Mileage</span>
                  <strong>{vehicle.mileageKm.toLocaleString('en-CA')} km</strong>
                </div>
                <div className="vdp-spec-tile">
                  <span>Powertrain</span>
                  <strong>{vehicle.drivetrain || 'AWD/2WD'}</strong>
                </div>
                <div className="vdp-spec-tile">
                  <span>Fuel</span>
                  <strong>{vehicle.fuelType || 'Gasoline'}</strong>
                </div>
                <div className="vdp-spec-tile">
                  <span>Transmission</span>
                  <strong>{vehicle.transmission || 'Automatic'}</strong>
                </div>
              </div>

              <div className="vdp-social-proof">
                <strong>Live shopper signal</strong>
                <p>1 person viewed this vehicle in the past 24 hours.</p>
              </div>

              <div className="vdp-cta-stack">
                <Link className="button button-primary" href="/purchase">
                  Reserve With Deposit
                </Link>
                <Link className="button button-secondary" href="/finance">
                  Apply for Financing
                </Link>
                <Link className="button button-secondary" href="/sell-or-trade">
                  Trade In Your Vehicle
                </Link>
              </div>
            </aside>
          </div>

          <section className="vdp-trust-block">
            <h2>Protection + Delivery Confidence</h2>
            <div className="vdp-chip-row">
              <span className="vdp-chip">10-Day Money-Back</span>
              <span className="vdp-chip">CARFAX Included</span>
              <span className="vdp-chip">Inspection Report Ready</span>
              <span className="vdp-chip">Extended Warranty Options</span>
              <span className="vdp-chip">Home Delivery Available</span>
              <span className="vdp-chip">VIN: {vehicle.vin}</span>
              <span className="vdp-chip">Stock #: {vehicle.stockNumber}</span>
              {vehicle.exteriorColor && <span className="vdp-chip">Exterior: {vehicle.exteriorColor}</span>}
              {vehicle.interiorColor && <span className="vdp-chip">Interior: {vehicle.interiorColor}</span>}
              {vehicle.bodyStyle && <span className="vdp-chip">Body: {vehicle.bodyStyle}</span>}
            </div>
          </section>
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
