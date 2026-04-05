'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { parseVehicleCtaContext } from '@/lib/cta/context';
import FinanceLeadForm from '@/components/finance/FinanceLeadForm';

export default function FinanceRuntimePanel() {
  const searchParams = useSearchParams();
  const ctx = parseVehicleCtaContext(searchParams);

  return (
    <>
      {ctx && (
        <article className="flow-context-card">
          <p className="eyebrow">Financing for</p>
          <h2>
            {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
          </h2>
          <p className="muted">
            Listed at ${ctx.vehiclePriceCad.toLocaleString('en-CA')}
          </p>
        </article>
      )}

      <div className="flow-grid">
        {ctx ? (
          <FinanceLeadForm
            vehicleId={ctx.vehicleId}
            vehicleSlug={ctx.vehicleSlug}
            vehicleLabel={`${ctx.vehicleYear} ${ctx.vehicleMake} ${ctx.vehicleModel}`}
            vehiclePriceCad={ctx.vehiclePriceCad}
          />
        ) : (
          <article className="flow-card">
            <h2>Select a Vehicle First</h2>
            <p className="muted">
              Finance submissions require a vehicle reference. Please start from an inventory
              vehicle detail page so the application is tied to the correct unit.
            </p>
            <Link className="button button-primary" href="/inventory">
              Choose Vehicle
            </Link>
          </article>
        )}

        <aside className="flow-card flow-steps">
          <h3>What Happens Next</h3>
          <ol>
            <li>Application is validated at server boundary.</li>
            <li>Vehicle facts are resolved from live inventory source of truth.</li>
            <li>Lead is queued and dispatched to lender/CRM pipeline.</li>
            <li>Team follows up with options and next steps.</li>
          </ol>
          <Link className="button button-secondary" href="/inventory">
            Back to Inventory
          </Link>
        </aside>
      </div>
    </>
  );
}
