import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getVehicleBySlug, getInventory } from '@/lib/inventory';
import { vdpMetadata, vdpJsonLd } from '@/lib/seo';
import { getSoldPhase, formatCAD, formatKm, slugify } from '@/lib/utils';
import { BASE_URL } from '@/lib/types';
// Delivery cost estimator — isolated component, zero effect on existing page logic
import TransportationCalculator from '@/components/TransportationCalculator';

// Revalidate every 5 minutes
export const revalidate = 300;

type Props = {
  params: { make: string; model: string; slug: string };
};

// ── Generate static params for top vehicles at build time ────
export async function generateStaticParams() {
  const inventory = await getInventory();
  return inventory
    .filter(v => getSoldPhase(v.status, v.soldAt) === 1)
    .map(v => ({
      make:  slugify(v.make),
      model: slugify(v.model),
      slug:  v.canonicalPath.split('/').filter(Boolean).pop() || '',
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicleBySlug(params.slug);
  if (!vehicle) return { title: 'Vehicle Not Found | Planet Motors' };
  return vdpMetadata(vehicle);
}

export default async function VdpPage({ params }: Props) {
  const vehicle = await getVehicleBySlug(params.slug);

  if (!vehicle) notFound();

  const phase = getSoldPhase(vehicle.status, vehicle.soldAt);

  // Phase 3 (sold > 30 days): 301 redirect to parent SRP
  if (phase === 3) {
    redirect(`/inventory/used/${slugify(vehicle.make)}/${slugify(vehicle.model)}/`);
  }

  const trimPart = vehicle.trim ? ` ${vehicle.trim}` : '';
  const fullName = `${vehicle.year} ${vehicle.make} ${vehicle.model}${trimPart}`;
  const jsonLd   = vdpJsonLd(vehicle);
  const isSold   = phase === 2;

  const fuelLabel: Record<string, string> = {
    electric:       'Electric',
    hybrid:         'Hybrid',
    'plug-in hybrid': 'Plug-in Hybrid',
    gasoline:       'Gasoline',
    diesel:         'Diesel',
  };

  return (
    <>
      {/* VDP JSON-LD: Vehicle + ImageObject + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main itemScope itemType="https://schema.org/Vehicle">

        {/* Breadcrumb nav — visible + crawlable */}
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/inventory/used/">Inventory</a></li>
            <li><a href={`/inventory/used/${slugify(vehicle.make)}/`}>{vehicle.make}</a></li>
            <li><a href={`/inventory/used/${slugify(vehicle.make)}/${slugify(vehicle.model)}/`}>{vehicle.model}</a></li>
            <li aria-current="page">{fullName}</li>
          </ol>
        </nav>

        {/* H1 — required by SEO addendum */}
        <h1 itemProp="name">{fullName}</h1>

        {isSold && (
          <div role="alert" aria-label="Vehicle sold">
            Recently Sold. View similar vehicles below.
          </div>
        )}

        {/* Hero image — NOT lazy-loaded (above the fold) */}
        {vehicle.images[0] && (
          <img
            src={vehicle.images[0].url}
            alt={vehicle.images[0].alt}
            width={vehicle.images[0].width || 800}
            height={vehicle.images[0].height || 533}
            loading="eager"
            fetchPriority="high"
            itemProp="image"
          />
        )}

        {/* Gallery thumbnails — lazy-loaded */}
        {vehicle.images.slice(1).map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={img.alt}
            width={img.width || 400}
            height={img.height || 267}
            loading="lazy"
          />
        ))}

        {/* Core specs — crawlable HTML */}
        <section aria-label="Vehicle specifications">
          <p itemProp="mileageFromOdometer" content={String(vehicle.km)}>{formatKm(vehicle.km)}</p>
          <p itemProp="fuelType">{fuelLabel[vehicle.fuel] || vehicle.fuel}</p>
          <p itemProp="color">{vehicle.color}</p>
          <p itemProp="vehicleIdentificationNumber">{vehicle.vin}</p>
          {vehicle.evRange && <p>Range: {vehicle.evRange} km</p>}
        </section>

        {/* Pricing — crawlable HTML */}
        <section aria-label="Pricing" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="CAD" />
          <meta itemProp="availability" content={isSold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock'} />
          <p itemProp="price" content={String(vehicle.price)}>{formatCAD(vehicle.price)}</p>
          <p>{formatCAD(vehicle.biweekly)}/biweekly · $0 down</p>
        </section>

        {/* Description */}
        <section aria-label="Description">
          <p itemProp="description">{vehicle.description}</p>
        </section>

        {/* CTAs — disabled when sold */}
        {!isSold && (
          <section aria-label="Actions">
            <a href="/finance/">Apply for Financing</a>
            <a href="/contact/">Reserve This Vehicle</a>
          </section>
        )}

        {/* Delivery Cost Estimator — drop-in component, styles scoped to .tc-* prefix */}
        <section aria-label="Delivery cost estimator">
          <TransportationCalculator />
        </section>

        {/* Internal links */}
        <nav aria-label="Related searches">
          <a href={`/inventory/used/${slugify(vehicle.make)}/`}>More used {vehicle.make}</a>
          <a href={`/inventory/used/${slugify(vehicle.make)}/${slugify(vehicle.model)}/`}>More {vehicle.make} {vehicle.model}</a>
          <a href="/inventory/used/">All inventory</a>
          <a href="/finance/">Get financing</a>
          <a href="/sell/">Sell my car</a>
        </nav>

      </main>
    </>
  );
}
