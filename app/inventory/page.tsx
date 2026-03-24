import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { buildInventoryJsonLd } from '@/lib/seo/structuredData';
import { buildAbsoluteUrl, buildCanonicalVdpPath } from '@/lib/seo/routes';
import { REVALIDATE_SECONDS } from '@/lib/cache/policies';
import { getPublicInventoryVehicles } from '@/lib/data/vehicles';

export const revalidate = REVALIDATE_SECONDS.inventory;
export const dynamic = 'force-static';
export const fetchCache = 'default-cache';

export const metadata: Metadata = {
  title: 'Used Inventory | Planet Motors',
  description: 'Browse Planet Motors used inventory with pricing, specs, and availability.',
  alternates: {
    canonical: buildAbsoluteUrl('/inventory'),
  },
  openGraph: {
    type: 'website',
    url: buildAbsoluteUrl('/inventory'),
    title: 'Used Inventory | Planet Motors',
    description: 'Browse Planet Motors used inventory with pricing, specs, and availability.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Used Inventory | Planet Motors',
    description: 'Browse Planet Motors used inventory with pricing, specs, and availability.',
  },
};

export default async function InventoryPage() {
  const vehicles = await getPublicInventoryVehicles();
  const jsonLd = buildInventoryJsonLd(vehicles);

  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Planet Motors</div>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/inventory">Inventory</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Inventory</p>
            <h1 className="hero-title">Used vehicles</h1>
            <p className="muted">Server-rendered inventory powered by canonical nested VDP links.</p>
          </div>

          <div className="card-grid three-up">
            {vehicles.map((vehicle) => (
              <article className="card vehicle-card" key={vehicle.id}>
                <div className="placeholder-media small">Vehicle Image</div>
                <h2>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                <p className="muted">
                  {vehicle.mileageKm.toLocaleString()} km · {vehicle.drivetrain || 'N/A'} ·{' '}
                  {vehicle.transmission || 'N/A'}
                </p>
                <strong>${(vehicle.salePriceCad ?? vehicle.priceCad).toLocaleString()}</strong>
                <p>
                  <Link
                    href={buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug)}
                    prefetch={false}
                  >
                    View details
                  </Link>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <JsonLdScript data={jsonLd} />
    </main>
  );
}
