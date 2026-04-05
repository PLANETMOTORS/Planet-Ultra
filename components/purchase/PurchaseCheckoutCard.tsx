'use client';

import { useState } from 'react';

type PurchaseCheckoutCardProps = {
  vehicleId: string;
  vehicleSlug: string;
  vehicleLabel: string;
  vehiclePriceCad: number;
};

type PurchaseSubmitResponse = {
  sessionId: string;
  publishableKey: string;
  vehicleId: string;
  amountCents: number;
  checkoutUrl?: string;
  purchaseSubmissionId?: string;
};

export default function PurchaseCheckoutCard({
  vehicleId,
  vehicleSlug,
  vehicleLabel,
  vehiclePriceCad,
}: PurchaseCheckoutCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseSubmitResponse | null>(null);

  async function createCheckoutSession() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/purchase/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, vehicleSlug }),
      });

      const data = (await response.json()) as PurchaseSubmitResponse | { error?: string };
      if (!response.ok || !('sessionId' in data)) {
        throw new Error('error' in data && data.error ? data.error : 'Could not create checkout session.');
      }

      setResult(data);
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Purchase submit failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flow-card">
      <h2>Deposit Checkout</h2>
      <p className="muted">
        Secure <strong>{vehicleLabel}</strong> with a refundable deposit. Current listing price is $
        {vehiclePriceCad.toLocaleString('en-CA')}.
      </p>

      <div className="flow-field-grid" aria-label="Purchase checkout details">
        <label>
          <span>Vehicle ID</span>
          <input type="text" value={vehicleId} readOnly />
        </label>
        <label>
          <span>Vehicle Slug</span>
          <input type="text" value={vehicleSlug} readOnly />
        </label>
      </div>

      <div className="flow-submit-row">
        <button className="button button-primary" type="button" onClick={createCheckoutSession} disabled={loading}>
          {loading ? 'Creating Secure Checkout...' : 'Reserve with Deposit'}
        </button>
      </div>

      {error ? <p className="sell-form-error">{error}</p> : null}

      {result ? (
        <div className="flow-note">
          <p className="sell-form-success">
            Session created: <code>{result.sessionId}</code>
          </p>
          <p className="muted">
            Deposit amount: ${(result.amountCents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
          </p>
          {result.checkoutUrl ? (
            <a className="button button-secondary" href={result.checkoutUrl}>
              Open Secure Checkout
            </a>
          ) : (
            <p className="muted">Stripe live redirect is not enabled in this environment yet.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
