import type { Metadata } from 'next';
import { parseVehicleCtaContext } from '@/lib/cta/context';

/**
 * /finance — public. Server Component.
 *
 * Accepts optional vehicle context via search params (from VDP CTA).
 * Pre-fills vehicle info from params — no business logic in UI.
 * Finance submission goes to /api/finance/submit (server boundary).
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Apply for Financing',
  description:
    'Apply for vehicle financing at Planet Motors. Quick online application — our finance team will contact you.',
  alternates: { canonical: '/finance' },
};

interface FinancePageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const params = await searchParams;
  const ctx = parseVehicleCtaContext(params);

  return (
    <main>
      <div className="container section">
        <h1>Apply for Financing</h1>

        {ctx && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <p className="eyebrow">Financing for</p>
            <h2>
              {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
            </h2>
            <p className="muted">
              Listed at ${ctx.vehiclePriceCad.toLocaleString('en-CA')}
            </p>
          </div>
        )}

        <div className="card">
          <p className="muted" style={{ marginBottom: '16px' }}>
            Complete the form below and our finance team will contact you within
            one business day. Your application is submitted securely — your
            information is never stored on our servers.
          </p>

          {/*
            Finance form shell.
            The form action POSTs to /api/finance/submit (server Route Handler).
            Vehicle context is passed as hidden fields — pre-populated from
            server-resolved params, not from client state.
            UI implementation (inputs, labels, validation) is an A3 shell concern.
          */}
          <form action="/api/finance/submit" method="POST">
            {ctx && (
              <>
                <input type="hidden" name="vehicleId" value={ctx.vehicleId} />
                <input type="hidden" name="vehicleSlug" value={ctx.vehicleSlug} />
                <input type="hidden" name="vehicleYear" value={ctx.vehicleYear} />
                <input type="hidden" name="vehicleMake" value={ctx.vehicleMake} />
                <input type="hidden" name="vehicleModel" value={ctx.vehicleModel} />
                <input type="hidden" name="vehiclePriceCad" value={ctx.vehiclePriceCad} />
              </>
            )}
            <p className="muted">
              Finance application form inputs — to be wired in A3 shell integration.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
