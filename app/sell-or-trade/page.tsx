import type { Metadata } from 'next';
import { parseVehicleCtaContext } from '@/lib/cta/context';

/**
 * /sell-or-trade — public shell. Server Component.
 *
 * Accepts optional vehicle context so the trade-in flow can acknowledge the
 * shopper's current vehicle of interest before the dedicated appraisal form
 * is wired in a later phase.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sell or Trade',
  description:
    'Start your Planet Motors trade-in appraisal online and get a fast offer on your current vehicle.',
  alternates: { canonical: '/sell-or-trade' },
};

interface SellOrTradePageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function SellOrTradePage({
  searchParams,
}: SellOrTradePageProps) {
  const params = await searchParams;
  const ctx = parseVehicleCtaContext(params);

  return (
    <main>
      <div className="container section">
        <h1>Sell or Trade</h1>

        {ctx && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Trading toward</p>
            <h2>
              {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
            </h2>
            <p className="muted">
              We&apos;ll keep this vehicle context attached as the appraisal flow is
              wired.
            </p>
          </div>
        )}

        <div className="card">
          <p className="muted">
            Trade-in appraisal inputs and valuation steps are reserved for the
            next shell integration pass.
          </p>
        </div>
      </div>
    </main>
  );
}
