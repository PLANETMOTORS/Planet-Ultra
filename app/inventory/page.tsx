import { Suspense } from 'react';
import Link from 'next/link';
import { VehicleImage } from '@/components/media/VehicleImage';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  getAllVehicles,
  getInventoryFilterOptions,
} from '@/lib/data/vehicleQueries';
import { buildInventoryMetadata } from '@/lib/seo/metadata';
import { buildInventoryJsonLd } from '@/lib/seo/schema';
import { buildInventoryPath, buildVehicleCanonicalPath } from '@/lib/site/routes';
import type { Metadata } from 'next';

type SearchParamsValue = string | string[] | undefined;

type InventoryPageProps = {
  searchParams?: Promise<Record<string, SearchParamsValue>>;
};

function readSearchParam(value: SearchParamsValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export async function generateMetadata({
  searchParams,
}: InventoryPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = readSearchParam(resolvedSearchParams.q);
  const make = readSearchParam(resolvedSearchParams.make);
  const bodyStyle = readSearchParam(resolvedSearchParams.bodyStyle);
  const fuelType = readSearchParam(resolvedSearchParams.fuelType);
  const filtersApplied = Boolean(query || make || bodyStyle || fuelType);

  return buildInventoryMetadata({
    query,
    filtersApplied,
  });
}

function InventoryPageFallback() {
  return (
    <>
      <section className="section page-hero">
        <div className="container">
          <p className="eyebrow">Inventory</p>
          <h1 className="page-title">Browse used inventory</h1>
          <p className="hero-copy">
            Preparing inventory filters and canonical listing results.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="card">
            <p className="muted">Loading inventory results...</p>
          </article>
        </div>
      </section>
    </>
  );
}

async function InventoryPageContent({ searchParams }: InventoryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const query = readSearchParam(resolvedSearchParams.q).trim();
  const make = readSearchParam(resolvedSearchParams.make).trim();
  const bodyStyle = readSearchParam(resolvedSearchParams.bodyStyle).trim();
  const fuelType = readSearchParam(resolvedSearchParams.fuelType).trim();

  const vehicles = getAllVehicles().filter((vehicle) => {
    const matchesQuery =
      query.length === 0 ||
      [vehicle.year, vehicle.make, vehicle.model, vehicle.trim, vehicle.stockNumber]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesMake = make.length === 0 || vehicle.make === make;
    const matchesBodyStyle = bodyStyle.length === 0 || vehicle.bodyStyle === bodyStyle;
    const matchesFuelType = fuelType.length === 0 || vehicle.fuelType === fuelType;

    return matchesQuery && matchesMake && matchesBodyStyle && matchesFuelType;
  });

  const filterOptions = getInventoryFilterOptions();

  return (
    <>
      <StructuredData
        data={buildInventoryJsonLd(vehicles)}
        id="inventory-structured-data"
      />

      <section className="section page-hero">
        <div className="container">
          <p className="eyebrow">Inventory</p>
          <h1 className="page-title">Browse used inventory</h1>
          <p className="hero-copy">
            Server-rendered listing page with canonical inventory metadata and
            filter-aware noindex handling for non-canonical query views.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container inventory-toolbar">
          <article className="card filter-card">
            <h2>Search and filter</h2>
            <form className="filter-grid" action="/inventory" method="get">
              <label className="filter-field">
                <span>Search</span>
                <input
                  defaultValue={query}
                  name="q"
                  placeholder="BMW, Tesla, stock number..."
                  type="search"
                />
              </label>

              <label className="filter-field">
                <span>Make</span>
                <select defaultValue={make} name="make">
                  <option value="">All makes</option>
                  {filterOptions.makes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-field">
                <span>Body style</span>
                <select defaultValue={bodyStyle} name="bodyStyle">
                  <option value="">All body styles</option>
                  {filterOptions.bodyStyles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-field">
                <span>Fuel type</span>
                <select defaultValue={fuelType} name="fuelType">
                  <option value="">All fuel types</option>
                  {filterOptions.fuelTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="filter-actions">
                <button className="button button-primary" type="submit">
                  Apply filters
                </button>
                <Link className="button button-secondary" href={buildInventoryPath()}>
                  Reset
                </Link>
              </div>
            </form>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="inventory-summary">
            <h2>{vehicles.length} vehicles available</h2>
            <p className="muted">
              Vehicle facts remain aligned to the source-of-truth contract while
              image delivery stays on the frontend media boundary.
            </p>
          </div>

          <div className="card-grid inventory-grid">
            {vehicles.map((vehicle) => (
              <article className="card vehicle-card" key={vehicle.id}>
                <VehicleImage
                  image={vehicle.heroImage}
                  alt={vehicle.heroImage.alt || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="vehicle-card-media"
                  sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <p className="eyebrow">{vehicle.stockNumber}</p>
                <h3>{[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')}</h3>
                <p className="muted">
                  {vehicle.mileageKm.toLocaleString('en-CA')} km
                  {vehicle.bodyStyle ? ` · ${vehicle.bodyStyle}` : ''}
                  {vehicle.fuelType ? ` · ${vehicle.fuelType}` : ''}
                </p>
                <strong>${(vehicle.salePriceCad ?? vehicle.priceCad).toLocaleString('en-CA')}</strong>
                <div className="card-actions">
                  <Link
                    className="button button-secondary"
                    href={buildVehicleCanonicalPath(vehicle)}
                  >
                    View canonical VDP
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function InventoryPage(props: InventoryPageProps) {
  return (
    <main>
      <Suspense fallback={<InventoryPageFallback />}>
        <InventoryPageContent {...props} />
      </Suspense>
    </main>
  );
}
