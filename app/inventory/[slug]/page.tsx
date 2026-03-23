import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getVehicleVdp } from '@/lib/vehicles/getVehicleVdp';
import { buildVehicleMetadata } from '@/lib/seo/buildVehicleMetadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ── SEO metadata ──────────────────────────────────────────── */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVehicleVdp(slug);
  if (!data) return { title: 'Vehicle Not Found' };
  return buildVehicleMetadata(data.vehicle);
}

/* ── Page ──────────────────────────────────────────────────── */

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getVehicleVdp(slug);
  if (!data) notFound();

  const { vehicle, heroImage, spinSets } = data;

  const titleLine = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(' ');

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      {/* ── Section A: Title & Facts ─────────────────────── */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold">{titleLine}</h1>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <span>{vehicle.mileageKm.toLocaleString()} km</span>
          {vehicle.drivetrain && <span>{vehicle.drivetrain}</span>}
          {vehicle.transmission && <span>{vehicle.transmission}</span>}
          {vehicle.fuelType && <span>{vehicle.fuelType}</span>}
          {vehicle.exteriorColor && <span>{vehicle.exteriorColor}</span>}
        </div>

        <div className="mt-4 flex items-baseline gap-4">
          <span className="text-2xl font-semibold">
            ${vehicle.priceCad.toLocaleString()}
          </span>
          {vehicle.salePriceCad && (
            <span className="text-lg text-red-600 line-through">
              ${vehicle.salePriceCad.toLocaleString()}
            </span>
          )}
        </div>

        {vehicle.status !== 'available' && (
          <span className="mt-2 inline-block rounded bg-yellow-100 px-3 py-1 text-xs font-medium uppercase text-yellow-800">
            {vehicle.status}
          </span>
        )}
      </section>

      {/* ── Section B: Hero Image ────────────────────────── */}
      {heroImage.url && (
        <section className="mb-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={heroImage.url}
              alt={heroImage.alt ?? titleLine}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </section>
      )}

      {/* ── Section C: Description & Features ────────────── */}
      {(vehicle.description || vehicle.featureBullets?.length || vehicle.packages?.length || vehicle.options?.length) && (
        <section className="mb-8 space-y-6">
          {vehicle.description && (
            <div>
              <h2 className="text-xl font-semibold">About This Vehicle</h2>
              <p className="mt-2 text-gray-700 leading-relaxed">{vehicle.description}</p>
            </div>
          )}

          {vehicle.featureBullets && vehicle.featureBullets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Key Features</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
                {vehicle.featureBullets.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {vehicle.packages && vehicle.packages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Packages</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
                {vehicle.packages.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {vehicle.options && vehicle.options.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Options</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
                {vehicle.options.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── Section D: 360 Spin Module ───────────────────── */}
      {spinSets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold">360&deg; View</h2>
          <div className="mt-4 space-y-4">
            {spinSets.map((spin, i) => (
              <div
                key={i}
                className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100"
              >
                <iframe
                  src={spin.url}
                  title={`${titleLine} — ${spin.type} view`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Vehicle Specs Summary ────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold">Vehicle Details</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <Detail label="Stock #" value={vehicle.stockNumber} />
          <Detail label="VIN" value={vehicle.vin} />
          <Detail label="Year" value={String(vehicle.year)} />
          <Detail label="Make" value={vehicle.make} />
          <Detail label="Model" value={vehicle.model} />
          {vehicle.trim && <Detail label="Trim" value={vehicle.trim} />}
          {vehicle.bodyStyle && <Detail label="Body Style" value={vehicle.bodyStyle} />}
          {vehicle.drivetrain && <Detail label="Drivetrain" value={vehicle.drivetrain} />}
          {vehicle.transmission && <Detail label="Transmission" value={vehicle.transmission} />}
          {vehicle.fuelType && <Detail label="Fuel Type" value={vehicle.fuelType} />}
          {vehicle.exteriorColor && <Detail label="Exterior" value={vehicle.exteriorColor} />}
          {vehicle.interiorColor && <Detail label="Interior" value={vehicle.interiorColor} />}
          <Detail label="Mileage" value={`${vehicle.mileageKm.toLocaleString()} km`} />
        </dl>
      </section>
    </main>
  );
}

/* ── Helper ────────────────────────────────────────────────── */

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
