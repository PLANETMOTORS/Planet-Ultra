'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { parseVehicleCtaContext } from '@/lib/cta/context';
import PurchaseCheckoutCard from '@/components/purchase/PurchaseCheckoutCard';

function buildSignInUrl(searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  const redirectTarget = query ? `/purchase?${query}` : '/purchase';
  return `/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`;
}

export default function PurchaseFlowClient() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const ctx = parseVehicleCtaContext(params);
  const signInUrl = buildSignInUrl(params);

  if (!ctx) {
    return (
      <article className="flow-card">
        <h2>No Vehicle Selected</h2>
        <p className="muted">
          Please <Link href="/inventory">browse inventory</Link> and use the purchase button on a
          vehicle detail page.
        </p>
      </article>
    );
  }

  return (
    <>
      <article className="flow-context-card">
        <p className="eyebrow">Securing</p>
        <h2>
          {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
        </h2>
        <p className="muted">Listed at ${ctx.vehiclePriceCad.toLocaleString('en-CA')}</p>
      </article>

      <article className="flow-card purchase-auth-card">
        <h2>Sign In Recommended</h2>
        <p className="muted">
          Deposit session creation requires an authenticated account. Sign in first for a faster
          checkout handoff.
        </p>
        <a className="button button-secondary" href={signInUrl}>
          Sign In
        </a>
      </article>

      <div className="flow-grid">
        <PurchaseCheckoutCard
          vehicleId={ctx.vehicleId}
          vehicleSlug={ctx.vehicleSlug}
          vehicleLabel={`${ctx.vehicleYear} ${ctx.vehicleMake} ${ctx.vehicleModel}`}
          vehiclePriceCad={ctx.vehiclePriceCad}
        />

        <aside className="flow-card flow-steps">
          <h3>Checkout Sequence</h3>
          <ol>
            <li>Validate signed-in user and vehicle reference.</li>
            <li>Create Stripe deposit session server-side.</li>
            <li>Persist purchase lifecycle submission and event trail.</li>
            <li>Send CRM dispatch receipt and continue to delivery scheduling.</li>
          </ol>
          <Link className="button button-secondary" href="/inventory">
            Back to Inventory
          </Link>
        </aside>
      </div>
    </>
  );
}
