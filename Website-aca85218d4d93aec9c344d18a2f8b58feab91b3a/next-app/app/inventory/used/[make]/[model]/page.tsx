import type { Metadata } from 'next';
import Image from 'next/image';
import { getFilteredInventory } from '@/lib/inventory';
import { srpMetadata } from '@/lib/seo';
import { BASE_URL } from '@/lib/types';
import { formatCAD, formatKm } from '@/lib/utils';

export const revalidate = 300;

type Props = { params: { make: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const make  = params.make.charAt(0).toUpperCase()  + params.make.slice(1);
  const model = params.model.charAt(0).toUpperCase() + params.model.slice(1);
  return srpMetadata({ make, model });
}

export default async function ModelHubPage({ params }: Props) {
  const makeDisplay  = params.make.charAt(0).toUpperCase()  + params.make.slice(1);
  const modelDisplay = params.model.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const { vehicles, total } = await getFilteredInventory({ make: params.make, model: params.model, limit: 24 });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',      item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Inventory', item: `${BASE_URL}/inventory/used/` },
            { '@type': 'ListItem', position: 3, name: makeDisplay, item: `${BASE_URL}/inventory/used/${params.make}/` },
            { '@type': 'ListItem', position: 4, name: `Used ${makeDisplay} ${modelDisplay}`, item: `${BASE_URL}/inventory/used/${params.make}/${params.model}/` },
          ],
        })
      }} />

      <main>
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> › <a href="/inventory/used/">Inventory</a> › <a href={`/inventory/used/${params.make}/`}>{makeDisplay}</a> › {modelDisplay}
        </nav>
        <h1>Used {makeDisplay} {modelDisplay} for Sale in Richmond Hill, ON</h1>
        <p>{total} {makeDisplay} {modelDisplay} available at Planet Motors</p>

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
      </main>
    </>
  );
}
