import type { Metadata } from 'next';
import Image from 'next/image';
import { getFilteredInventory } from '@/lib/inventory';
import { srpMetadata } from '@/lib/seo';
import { BASE_URL } from '@/lib/types';
import { formatCAD, formatKm } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

// Revalidate every 5 minutes — keeps inventory fresh without blocking requests
export const revalidate = 300;

type Props = { searchParams: Record<string, string> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const base = srpMetadata({
    make:  searchParams.make,
    model: searchParams.model,
    fuel:  searchParams.fuel,
  });
  // Noindex faceted/filtered pages — query-param filters create duplicate content
  const hasFilters = !!(searchParams.make || searchParams.model || searchParams.fuel || searchParams.body || searchParams.page);
  if (hasFilters) {
    base.robots = { index: false, follow: true };
  }
  return base;
}

export default async function InventoryPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;

  const { vehicles, total, totalPages } = await getFilteredInventory({
    make:  searchParams.make,
    model: searchParams.model,
    fuel:  searchParams.fuel,
    body:  searchParams.body,
    page,
    limit: 12,
  });

  const title = 'Used EVs & Cars for Sale in Richmond Hill, ON';

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':    'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home',      item: `${BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Inventory', item: `${BASE_URL}/inventory/used/` },
            ],
          }),
        }}
      />

      <main>
        <h1>{title}</h1>
        <p>{total} vehicles available</p>

        {/* SSR Vehicle Grid — fully crawlable HTML */}
        <div className="inventory-grid">
          {vehicles.map((v, i) => (
            <VehicleCard key={v.stock} vehicle={v} priority={i === 0} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Inventory pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a
                key={p}
                href={`/inventory/used/?page=${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </a>
            ))}
          </nav>
        )}

        {/* Internal links to key hubs */}
        <nav aria-label="Browse by category">
          <a href="/inventory/used/tesla/">Used Tesla</a>
          <a href="/inventory/used/tesla/model-3/">Used Tesla Model 3</a>
          <a href="/inventory/used/tesla/model-y/">Used Tesla Model Y</a>
          <a href="/inventory/used/electric/">Used Electric Vehicles</a>
          <a href="/inventory/used/in-richmond-hill-on/">Cars in Richmond Hill</a>
          <a href="/finance/">Get Financing</a>
          <a href="/sell/">Sell My Car</a>
        </nav>
      </main>
    </>
  );
}

function VehicleCard({ vehicle: v, priority = false }: { vehicle: Vehicle; priority?: boolean }) {
  return (
    <article>
      <a href={v.canonicalPath}>
        {v.images[0] && (
          <Image
            src={v.images[0].url}
            alt={v.images[0].alt}
            width={v.images[0].width || 640}
            height={v.images[0].height || 427}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
        )}
        <h2>{v.year} {v.make} {v.model}{v.trim ? ` ${v.trim}` : ''}</h2>
        <p>{formatKm(v.km)}</p>
        <p>{formatCAD(v.price)}</p>
        <p>{formatCAD(v.biweekly)}/biweekly</p>
      </a>
    </article>
  );
}
