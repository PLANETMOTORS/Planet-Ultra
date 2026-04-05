'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { parseVehicleCtaContext } from '@/lib/cta/context';
import ProtectionQuoteForm from '@/components/protection/ProtectionQuoteForm';

export default function ProtectionRuntimePanel() {
  const searchParams = useSearchParams();
  const ctx = parseVehicleCtaContext(searchParams);

  if (!ctx) {
    return (
      <article className="flow-card">
        <h2>Select a Vehicle for Quote</h2>
        <p className="muted">
          Protection quote requires vehicle context. Open a vehicle detail page and use the
          protection CTA to prefill this flow.
        </p>
        <Link className="button button-primary" href="/inventory">
          Choose Vehicle
        </Link>
      </article>
    );
  }

  return (
    <>
      <article className="flow-context-card">
        <p className="eyebrow">Protection for</p>
        <h2>
          {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
        </h2>
      </article>

      <div className="flow-grid">
        <ProtectionQuoteForm
          vehicleId={ctx.vehicleId}
          vehicleYear={ctx.vehicleYear}
          vehicleMake={ctx.vehicleMake}
          vehicleModel={ctx.vehicleModel}
          vehiclePriceCad={ctx.vehiclePriceCad}
        />
        <aside className="flow-card flow-steps">
          <h3>Quote Sequence</h3>
          <ol>
            <li>Select plan level and current mileage.</li>
            <li>Submit request through protected server boundary.</li>
            <li>Review quote output for plan comparison.</li>
            <li>Finalize during purchase and finance handoff.</li>
          </ol>
          <Link className="button button-secondary" href="/inventory">
            Back to Inventory
          </Link>
        </aside>
      </div>
    </>
  );
}
