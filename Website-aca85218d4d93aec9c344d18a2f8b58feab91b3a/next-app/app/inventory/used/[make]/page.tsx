import type { Metadata } from 'next';
import Image from 'next/image';
import { getFilteredInventory } from '@/lib/inventory';
import { srpMetadata } from '@/lib/seo';
import { BASE_URL } from '@/lib/types';
import { formatCAD, formatKm } from '@/lib/utils';

export const revalidate = 300;

type Props = { params: { make: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const make = params.make.charAt(0).toUpperCase() + params.make.slice(1);
  return srpMetadata({ make });
}

export default async function MakeHubPage({ params }: Props) {
  const makeDisplay = params.make.charAt(0).toUpperCase() + params.make.slice(1);
  const { vehicles, total } = await getFilteredInventory({ make: params.make, limit: 24 });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',      item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Inventory', item: `${BASE_URL}/inventory/used/` },
            { '@type': 'ListItem', position: 3, name: `Used ${makeDisplay}`, item: `${BASE_URL}/inventory/used/${params.make}/` },
          ],
        })
      }} />

      <main>
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> › <a href="/inventory/used/">Inventory</a> › Used {makeDisplay}
        </nav>
        <h1>Used {makeDisplay} for Sale in Richmond Hill, ON</h1>
        <p>{total} {makeDisplay} vehicles available at Planet Motors</p>

        <div className="inventory-grid">
          {vehicles.map((v, i) => (
            <article key={v.stock}>
              <a href={v.canonicalPath}>
                {v.images[0] && (
                  <Image src={v.images[0].url} alt={v.images[0].alt} width={640} height={427} loading={i === 0 ? 'eager' : 'lazy'} priority={i === 0} />
                )}
                <h2>{v.year} {v.make} {v.model}{v.trim ? ` ${v.trim}` : ''}</h2>
                <p>{formatKm(v.km)} · {formatCAD(v.price)}</p>
              </a>
            </article>
          ))}
        </div>

        <nav aria-label="Related">
          <a href="/inventory/used/">All Inventory</a>
          <a href="/finance/">Financing</a>
          <a href="/sell/">Sell My Car</a>
        </nav>
      </main>
    </>
  );
}
