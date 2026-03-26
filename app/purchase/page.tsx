import type { Metadata } from 'next';
import Link from 'next/link';
import { parseVehicleCtaContext } from '@/lib/cta/context';
import { getSessionUserId } from '@/lib/auth/session';

/**
 * /purchase — public shell, auth-aware. Server Component.
 *
 * Accepts vehicle context via search params from the VDP CTA.
 * The deposit Stripe session is created via /api/purchase/submit (server boundary).
 * No Stripe keys or payment logic are ever in this component.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Start Purchase',
  description: 'Secure your vehicle with a refundable deposit at Planet Motors.',
  robots: { index: false, follow: false },
};

interface PurchasePageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function PurchasePage({ searchParams }: PurchasePageProps) {
  const params = await searchParams;
  const ctx = parseVehicleCtaContext(params);
  const userId = await getSessionUserId();
  const purchaseUrl = `/purchase?${new URLSearchParams(params).toString()}`;
  const signInUrl = `/sign-in?${new URLSearchParams({
    redirect_url: purchaseUrl,
  }).toString()}`;

  return (
    <main>
      <div className="container section">
        <h1>Start Purchase</h1>

        {ctx ? (
          <>
            <div className="card" style={{ marginBottom: '24px' }}>
              <p className="eyebrow">Securing</p>
              <h2>
                {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
              </h2>
              <p className="muted">
                Listed at ${ctx.vehiclePriceCad.toLocaleString('en-CA')}
              </p>
            </div>

            {!userId && (
              <div className="card" style={{ marginBottom: '16px' }}>
                <p className="muted">
                  Please{' '}
                  <Link href={signInUrl}>
                    sign in
                  </Link>{' '}
                  to place a deposit.
                </p>
              </div>
            )}

            {userId && (
              <div className="card">
                <p className="muted" style={{ marginBottom: '16px' }}>
                  A refundable deposit secures this vehicle for you. Your
                  deposit is processed securely through Stripe.
                </p>
                {/*
                  Deposit CTA — A5 wires a Client Component here that calls
                  /api/purchase/submit and redirects to the returned Stripe
                  Checkout session URL. No Stripe key in this shell.
                */}
                <p className="muted">
                  Deposit checkout — to be wired via /api/purchase/submit.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="card">
            <p className="muted">
              No vehicle selected. Please{' '}
              <Link href="/inventory">browse inventory</Link> and use the
              purchase button on the vehicle page.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
