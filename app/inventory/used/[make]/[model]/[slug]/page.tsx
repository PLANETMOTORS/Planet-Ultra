import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { VehicleImage } from '@/components/media/VehicleImage';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  getCanonicalVehiclePaths,
  getVehicleByCanonicalSegments,
} from '@/lib/data/vehicleQueries';
import { buildVehicleMetadata } from '@/lib/seo/metadata';
import { buildVehicleJsonLd } from '@/lib/seo/schema';
import { cacheProfiles } from '@/lib/site/cache';
import {
  getSafeVehicle360Asset,
  getVehicle360PosterImage,
  getVehicleGalleryImages,
  getVehicleHeroImage,
} from '@/lib/site/media';
import {
  buildInventoryPath,
  getVehicleDisplayName,
  getVehiclePrimaryPrice,
} from '@/lib/site/routes';

export const revalidate = cacheProfiles.vehicle;

const LazyVehicle360Viewer = dynamic(
  () => import('@/components/media/Vehicle360Viewer').then((module) => module.Vehicle360Viewer),
  {
    ssr: false,
    loading: () => null,
  },
);

type VehicleDetailPageProps = {
  params: Promise<{
    make: string;
    model: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getCanonicalVehiclePaths().map((path) => {
    const segments = path.split('/').filter(Boolean);

    return {
      make: segments[2],
      model: segments[3],
      slug: segments[4],
    };
  });
}

export async function generateMetadata({
  params,
}: VehicleDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const vehicle = getVehicleByCanonicalSegments(
    resolvedParams.make,
    resolvedParams.model,
    resolvedParams.slug,
  );

  if (!vehicle) {
    return {
      title: 'Vehicle not found | Planet Motors',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildVehicleMetadata(vehicle);
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const resolvedParams = await params;
  const vehicle = getVehicleByCanonicalSegments(
    resolvedParams.make,
    resolvedParams.model,
    resolvedParams.slug,
  );

  if (!vehicle) {
    notFound();
  }

  const displayName = getVehicleDisplayName(vehicle);
  const primaryPrice = getVehiclePrimaryPrice(vehicle);
  const heroImage = getVehicleHeroImage(vehicle);
  const galleryImages = getVehicleGalleryImages(vehicle);
  const safe360Asset = getSafeVehicle360Asset(vehicle.hero360Asset);
  const posterImage = getVehicle360PosterImage(vehicle);

  return (
    <main>
      <StructuredData
        data={buildVehicleJsonLd(vehicle)}
        id={`vehicle-structured-data-${vehicle.id}`}
      />

      <section className="section page-hero">
        <div className="container">
          <p className="eyebrow">{vehicle.stockNumber}</p>
          <h1 className="page-title">{displayName}</h1>
          <p className="hero-copy">
            Canonical nested vehicle detail page with route-specific metadata,
            server-rendered facts, and isolated media hydration.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container vdp-grid">
          <article className="card hero-card">
            <VehicleImage
              image={heroImage}
              alt={heroImage.alt || displayName}
              className="hero-media"
              preload
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </article>

          <aside className="card vdp-summary">
            <p className="eyebrow">Vehicle facts</p>
            <div className="vdp-price">
              ${primaryPrice.toLocaleString('en-CA')}
            </div>
            <div className="spec-list">
              <div className="spec-row">
                <span>Mileage</span>
                <strong>{vehicle.mileageKm.toLocaleString('en-CA')} km</strong>
              </div>
              <div className="spec-row">
                <span>Body style</span>
                <strong>{vehicle.bodyStyle || 'N/A'}</strong>
              </div>
              <div className="spec-row">
                <span>Fuel type</span>
                <strong>{vehicle.fuelType || 'N/A'}</strong>
              </div>
              <div className="spec-row">
                <span>Transmission</span>
                <strong>{vehicle.transmission || 'N/A'}</strong>
              </div>
              <div className="spec-row">
                <span>Exterior</span>
                <strong>{vehicle.exteriorColor || 'N/A'}</strong>
              </div>
            </div>

            <div className="card-actions">
              <a className="button button-primary" href={buildInventoryPath()}>
                Back to inventory
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split-grid">
          <article className="card">
            <p className="eyebrow">Gallery</p>
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <VehicleImage
                  key={`${image.url}-${index}`}
                  image={image}
                  alt={image.alt || `${displayName} gallery image ${index + 1}`}
                  className="gallery-media"
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              ))}
            </div>
          </article>

          <article className="card">
            <p className="eyebrow">360 view</p>
            <p className="muted">
              Poster-first, click-to-hydrate, and explicitly kept off the critical
              render path.
            </p>
            <LazyVehicle360Viewer
              asset={safe360Asset}
              label={displayName}
              poster={posterImage}
            />
          </article>
        </div>
      </section>
    </main>
  );
}
