import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { REVALIDATE_SECONDS } from '@/lib/cache/policies';
import { getVehicleByCanonicalParams } from '@/lib/data/vehicles';
import { safeCloudinaryMediaUrl } from '@/lib/media/cloudinary';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { buildVehicleMetadata } from '@/lib/seo/buildVehicleMetadata';
import { buildVehicleJsonLd } from '@/lib/seo/structuredData';

interface VdpPageProps {
  params: Promise<{
    make: string;
    model: string;
    slug: string;
  }>;
}

export const revalidate = REVALIDATE_SECONDS.vdp;
const Vehicle360Client = dynamic(() => import('./Vehicle360Client').then((mod) => mod.Vehicle360Client), {
  ssr: false,
  loading: () => (
    <p className="muted" style={{ marginTop: 12 }}>
      360 viewer is available after interaction.
    </p>
  ),
});

export async function generateMetadata({ params }: VdpPageProps): Promise<Metadata> {
  const { make, model, slug } = await params;
  const vehicle = await getVehicleByCanonicalParams(make, model, slug);

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found | Planet Motors',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildVehicleMetadata(vehicle);
}

export default async function CanonicalVdpPage({ params }: VdpPageProps) {
  const { make, model, slug } = await params;
  const vehicle = await getVehicleByCanonicalParams(make, model, slug);

  if (!vehicle) {
    notFound();
  }

  const vehicleJsonLd = buildVehicleJsonLd(vehicle);
  const safeHeroImage = safeCloudinaryMediaUrl(vehicle.heroImage.url);
  const safePosterImage = safeCloudinaryMediaUrl(vehicle.hero360Asset?.posterImageUrl);
  return (
    <main>
      <JsonLdScript data={vehicleJsonLd} />
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Planet Motors</div>
          <nav className="nav">
            <a href="/inventory">Shop Inventory</a>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Vehicle Details</p>
          <h1>{vehicle.year} {vehicle.make} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}</h1>
          <p className="muted">
            {vehicle.mileageKm.toLocaleString()} km · {vehicle.drivetrain || 'N/A'} · {vehicle.transmission || 'N/A'}
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container hero-grid">
          <article className="card">
            {safeHeroImage ? (
              <Image
                src={safeHeroImage}
                alt={vehicle.heroImage.alt || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                width={vehicle.heroImage.width || 1600}
                height={vehicle.heroImage.height || 900}
                sizes="(max-width: 900px) 100vw, 60vw"
                priority
                style={{ width: '100%', height: 'auto', borderRadius: 16 }}
              />
            ) : (
              <div className="placeholder-media small">Vehicle image unavailable</div>
            )}
            <h2 style={{ marginTop: 16 }}>Price</h2>
            <p className="muted">
              {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(
                vehicle.salePriceCad ?? vehicle.priceCad,
              )}
            </p>
          </article>

          <article className="card">
            <h2>360 View</h2>
            <p className="muted">
              360 media stays outside the critical render path and loads only on click.
            </p>
            {safePosterImage ? (
              <Image
                src={safePosterImage}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} 360 preview`}
                width={vehicle.heroImage.width || 1600}
                height={vehicle.heroImage.height || 900}
                sizes="(max-width: 900px) 100vw, 40vw"
                loading="lazy"
                style={{ width: '100%', height: 'auto', borderRadius: 16 }}
              />
            ) : (
              <div className="placeholder-media small">360 preview unavailable</div>
            )}
            {vehicle.hero360Asset ? (
              <Vehicle360Client asset={vehicle.hero360Asset} />
            ) : (
              <p className="muted">360 media is not available for this vehicle.</p>
            )}
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="card">
            <h2>Vehicle Highlights</h2>
            <div className="spec-list">
              <div className="spec-row">
                <span className="muted">Stock #</span>
                <strong>{vehicle.stockNumber}</strong>
              </div>
              <div className="spec-row">
                <span className="muted">VIN</span>
                <strong>{vehicle.vin}</strong>
              </div>
              <div className="spec-row">
                <span className="muted">Fuel</span>
                <strong>{vehicle.fuelType || 'N/A'}</strong>
              </div>
              <div className="spec-row">
                <span className="muted">Exterior</span>
                <strong>{vehicle.exteriorColor || 'N/A'}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
