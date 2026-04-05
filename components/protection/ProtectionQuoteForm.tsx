'use client';

import { FormEvent, useMemo, useState } from 'react';

type ProtectionQuoteFormProps = {
  vehicleId: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePriceCad: number;
};

type QuoteItem = {
  code: string;
  name: string;
  monthlyCad: number;
  totalCad: number;
  deductibleCad: number;
};

type QuoteResponse = {
  status: string;
  message?: string;
  vehicleId: string;
  quotes: QuoteItem[];
};

const productOptions = [
  { code: 'essential', label: 'Essential' },
  { code: 'comprehensive', label: 'Comprehensive' },
  { code: 'ultimate', label: 'Ultimate' },
];

export default function ProtectionQuoteForm({
  vehicleId,
  vehicleYear,
  vehicleMake,
  vehicleModel,
  vehiclePriceCad,
}: ProtectionQuoteFormProps) {
  const [mileageKm, setMileageKm] = useState('65000');
  const [products, setProducts] = useState<string[]>(['comprehensive']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResponse | null>(null);

  const vehicleLabel = useMemo(
    () => `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
    [vehicleMake, vehicleModel, vehicleYear],
  );

  function toggleProduct(code: string) {
    setProducts((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const mileage = Number(mileageKm);
    if (!Number.isFinite(mileage) || mileage <= 0) {
      setError('Mileage must be a positive number.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/protection/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          vehicleYear,
          vehicleMake,
          vehicleModel,
          vehiclePriceCad,
          mileageKm: mileage,
          products,
        }),
      });

      const data = (await response.json()) as QuoteResponse | { error?: string };
      if (!response.ok || !('quotes' in data)) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to fetch protection quote.');
      }
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Protection quote request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flow-card">
      <h2>Request Protection Quote</h2>
      <p className="muted">
        Quote options for <strong>{vehicleLabel}</strong> listed at $
        {vehiclePriceCad.toLocaleString('en-CA')}.
      </p>

      <form className="flow-field-grid" onSubmit={handleSubmit}>
        <label>
          <span>Vehicle ID</span>
          <input type="text" value={vehicleId} readOnly />
        </label>
        <label>
          <span>Mileage (km)</span>
          <input
            type="number"
            min={1}
            value={mileageKm}
            onChange={(event) => setMileageKm(event.target.value)}
            required
          />
        </label>
        <div className="protection-selection-row">
          <span className="protection-selection-label">Select plans</span>
          <div className="protection-selection-grid">
            {productOptions.map((product) => (
              <label key={product.code} className="protection-selection-item">
                <input
                  type="checkbox"
                  checked={products.includes(product.code)}
                  onChange={() => toggleProduct(product.code)}
                />
                <span>{product.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flow-submit-row">
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Requesting Quote...' : 'Get Protection Quote'}
          </button>
        </div>
      </form>

      {error ? <p className="sell-form-error">{error}</p> : null}

      {result ? (
        <div className="protection-quote-result">
          <p className="sell-form-success">{result.message ?? 'Protection quote response received.'}</p>
          <div className="protection-quote-grid">
            {result.quotes.map((quote) => (
              <article className="protection-quote-card" key={quote.code}>
                <h3>{quote.name}</h3>
                <p className="muted">${quote.monthlyCad.toLocaleString('en-CA')}/month</p>
                <p className="muted">Total: ${quote.totalCad.toLocaleString('en-CA')}</p>
                <p className="muted">Deductible: ${quote.deductibleCad.toLocaleString('en-CA')}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
