import type { Metadata } from 'next';
import { parseVehicleCtaContext } from '@/lib/cta/context';

/**
 * /protection — public shell. Server Component.
 *
 * F&I protection products (extended warranty, GAP, etc.).
 * Quote requests go to /api/protection/quote (stub in current phase).
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vehicle Protection',
  description:
    'Explore protection plans for your vehicle at Planet Motors. Extended warranty, GAP coverage, and more.',
  alternates: { canonical: '/protection' },
};

interface ProtectionPageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ProtectionPage({ searchParams }: ProtectionPageProps) {
  const params = await searchParams;
  const ctx = parseVehicleCtaContext(params);

  return (
    <main>
      <div className="container section">
        <h1>Vehicle Protection</h1>

        {ctx && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Protection for</p>
            <h2>
              {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
            </h2>
          </div>
        )}

        <div className="card">
          <p className="muted">
            Protection product options — to be wired via /api/protection/quote
            in a future phase.
          </p>
        </div>
      </div>
    </main>
  );
}
