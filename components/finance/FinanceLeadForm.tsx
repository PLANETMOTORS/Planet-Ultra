'use client';

import { FormEvent, useMemo, useState } from 'react';

type FinanceLeadFormProps = {
  vehicleId: string;
  vehicleSlug: string;
  vehicleLabel: string;
  vehiclePriceCad: number;
};

type FinanceSubmitResult = {
  status: 'accepted' | 'queued' | 'failed' | 'invalid';
  submissionId?: string;
  referenceId?: string;
  message?: string;
};

const termOptions = [24, 36, 48, 60, 72, 84];

export default function FinanceLeadForm({
  vehicleId,
  vehicleSlug,
  vehicleLabel,
  vehiclePriceCad,
}: FinanceLeadFormProps) {
  const suggestedDownPayment = useMemo(() => Math.max(1000, Math.round(vehiclePriceCad * 0.1)), [vehiclePriceCad]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [downPaymentCad, setDownPaymentCad] = useState(String(suggestedDownPayment));
  const [termMonths, setTermMonths] = useState(72);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinanceSubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const parsedDownPayment = Number(downPaymentCad);
    if (!Number.isFinite(parsedDownPayment) || parsedDownPayment < 0) {
      setError('Down payment must be a valid non-negative number.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/finance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          vehicleSlug,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          downPaymentCad: parsedDownPayment,
          termMonths,
        }),
      });

      const data = (await response.json()) as FinanceSubmitResult | { error?: string };
      if (!response.ok || !('status' in data)) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to submit finance application.');
      }

      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Finance submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="flow-card">
      <h2>Application Form</h2>
      <p className="muted">
        Applying for <strong>{vehicleLabel}</strong> listed at ${vehiclePriceCad.toLocaleString('en-CA')}.
      </p>

      <form className="flow-field-grid" onSubmit={handleSubmit}>
        <label>
          <span>First name</span>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="John"
            required
          />
        </label>
        <label>
          <span>Last name</span>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Doe"
            required
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="john@email.com"
            required
          />
        </label>
        <label>
          <span>Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+1 (___) ___-____"
            required
          />
        </label>
        <label>
          <span>Down payment (CAD)</span>
          <input
            type="number"
            min={0}
            step={100}
            value={downPaymentCad}
            onChange={(event) => setDownPaymentCad(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Term (months)</span>
          <select value={termMonths} onChange={(event) => setTermMonths(Number(event.target.value))}>
            {termOptions.map((months) => (
              <option key={months} value={months}>
                {months} months
              </option>
            ))}
          </select>
        </label>
        <div className="flow-submit-row">
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </div>
      </form>

      {error ? <p className="sell-form-error">{error}</p> : null}
      {result ? (
        <p className={result.status === 'failed' || result.status === 'invalid' ? 'sell-form-error' : 'sell-form-success'}>
          Status: <strong>{result.status}</strong>
          {result.submissionId ? ` | Submission: ${result.submissionId}` : ''}
          {result.referenceId ? ` | Ref: ${result.referenceId}` : ''}
          {result.message ? ` | ${result.message}` : ''}
        </p>
      ) : null}
    </article>
  );
}
