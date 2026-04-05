'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

type OfferResponse = {
  status: 'offered';
  submissionId?: string;
  offerAmountCad: number;
  offerExpiresAt: string;
};

type AcceptResponse = {
  status: 'scheduled' | 'accepted';
  submissionId: string;
  externalReference?: string;
};

type TradeInStatusResponse = {
  submissionId: string;
  status: string;
  offerAmountCad: number;
  offerExpiresAt: string;
  pickupDate: string | null;
  pickupWindow: string | null;
};

type WindowKey = 'morning' | 'afternoon' | 'evening';
type ConditionKey = 'excellent' | 'good' | 'fair' | 'poor';

const pickupWindowOptions: WindowKey[] = ['morning', 'afternoon', 'evening'];

function formatCad(value: number): string {
  return `$${value.toLocaleString('en-CA')}`;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TradeInLeadFlow() {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [year, setYear] = useState('2021');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [vin, setVin] = useState('');
  const [mileageKm, setMileageKm] = useState('45000');
  const [condition, setCondition] = useState<ConditionKey>('good');
  const [bodyStyle, setBodyStyle] = useState('suv');
  const [accidentsReported, setAccidentsReported] = useState('0');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [pickupDate, setPickupDate] = useState(todayIso);
  const [pickupWindow, setPickupWindow] = useState<WindowKey>('afternoon');

  const [offerResult, setOfferResult] = useState<OfferResponse | null>(null);
  const [acceptResult, setAcceptResult] = useState<AcceptResponse | null>(null);
  const [statusResult, setStatusResult] = useState<TradeInStatusResponse | null>(null);

  const [offerError, setOfferError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [offerLoading, setOfferLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  async function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOfferLoading(true);
    setOfferError(null);
    setAcceptError(null);
    setStatusError(null);
    setAcceptResult(null);
    setStatusResult(null);

    const parsedYear = Number(year);
    const parsedMileage = Number(mileageKm);
    const parsedAccidents = Number(accidentsReported);

    if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMileage) || !Number.isFinite(parsedAccidents)) {
      setOfferError('Please enter valid numeric values for year, mileage, and accidents.');
      setOfferLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/trade-in/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: vin.trim() || undefined,
          year: parsedYear,
          make: make.trim(),
          model: model.trim(),
          trim: trim.trim() || undefined,
          mileageKm: parsedMileage,
          condition,
          bodyStyle: bodyStyle.trim() || undefined,
          accidentsReported: parsedAccidents,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = (await response.json()) as OfferResponse | { error?: string };
      if (!response.ok || !('status' in data)) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to generate offer.');
      }

      setOfferResult(data);
    } catch (error) {
      setOfferResult(null);
      setOfferError(error instanceof Error ? error.message : 'Offer request failed.');
    } finally {
      setOfferLoading(false);
    }
  }

  async function acceptOffer() {
    if (!offerResult?.submissionId) {
      setAcceptError('No submission ID available yet. Request an offer first.');
      return;
    }

    setAcceptLoading(true);
    setAcceptError(null);

    try {
      const response = await fetch('/api/trade-in/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: offerResult.submissionId,
          pickupDate,
          pickupWindow,
        }),
      });

      const data = (await response.json()) as AcceptResponse | { error?: string };
      if (!response.ok || !('status' in data)) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to accept offer.');
      }

      setAcceptResult(data);
    } catch (error) {
      setAcceptResult(null);
      setAcceptError(error instanceof Error ? error.message : 'Acceptance request failed.');
    } finally {
      setAcceptLoading(false);
    }
  }

  async function fetchStatus() {
    if (!offerResult?.submissionId) {
      setStatusError('Request an offer first to check status.');
      return;
    }

    setStatusLoading(true);
    setStatusError(null);
    setStatusResult(null);

    try {
      const params = new URLSearchParams({ submissionId: offerResult.submissionId });
      const response = await fetch(`/api/trade-in/status?${params.toString()}`);
      const data = (await response.json()) as TradeInStatusResponse | { error?: string };
      if (!response.ok || !('status' in data)) {
        throw new Error('error' in data && data.error ? data.error : 'Unable to fetch status.');
      }

      setStatusResult(data);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Status request failed.');
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <article className="flow-card sell-form-card">
      <h2>Instant Offer Request</h2>
      <p className="muted">
        Enter your vehicle details and we&apos;ll return a real estimate from the live trade-in
        endpoint.
      </p>

      <form id="trade-in-offer-form" className="flow-field-grid" onSubmit={submitOffer}>
        <label>
          <span>Year</span>
          <input
            type="number"
            min={1990}
            max={new Date().getFullYear() + 1}
            value={year}
            onChange={(event) => setYear(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Mileage (km)</span>
          <input
            type="number"
            min={0}
            max={1000000}
            value={mileageKm}
            onChange={(event) => setMileageKm(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Make</span>
          <input
            type="text"
            value={make}
            onChange={(event) => setMake(event.target.value)}
            placeholder="Honda"
            required
          />
        </label>
        <label>
          <span>Model</span>
          <input
            type="text"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="CR-V"
            required
          />
        </label>
        <label>
          <span>Trim (optional)</span>
          <input
            type="text"
            value={trim}
            onChange={(event) => setTrim(event.target.value)}
            placeholder="EX-L"
          />
        </label>
        <label>
          <span>VIN (optional)</span>
          <input
            type="text"
            value={vin}
            onChange={(event) => setVin(event.target.value.toUpperCase())}
            maxLength={17}
            placeholder="17-character VIN"
          />
        </label>
        <label>
          <span>Condition</span>
          <select value={condition} onChange={(event) => setCondition(event.target.value as ConditionKey)}>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </label>
        <label>
          <span>Body style (optional)</span>
          <input
            type="text"
            value={bodyStyle}
            onChange={(event) => setBodyStyle(event.target.value)}
            placeholder="SUV"
          />
        </label>
        <label>
          <span>Accidents reported</span>
          <input
            type="number"
            min={0}
            max={10}
            value={accidentsReported}
            onChange={(event) => setAccidentsReported(event.target.value)}
          />
        </label>
        <label>
          <span>Email (optional)</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
          />
        </label>
        <label>
          <span>Phone (optional)</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+1 (___) ___-____"
          />
        </label>
        <div className="sell-form-submit-row">
          <button className="button button-primary" type="submit" disabled={offerLoading}>
            {offerLoading ? 'Generating Offer…' : 'Get Instant Offer'}
          </button>
        </div>
      </form>

      {offerError && <p className="sell-form-error">{offerError}</p>}

      {offerResult && (
        <div className="sell-offer-result">
          <p className="eyebrow">Estimated Offer</p>
          <h3>{formatCad(offerResult.offerAmountCad)}</h3>
          <p className="muted">
            Expires {formatDate(offerResult.offerExpiresAt)}
            {offerResult.submissionId ? ` · Ref ${offerResult.submissionId.slice(0, 8).toUpperCase()}` : ''}
          </p>

          <div className="sell-accept-grid">
            <label>
              <span>Pickup date</span>
              <input
                type="date"
                value={pickupDate}
                min={todayIso}
                onChange={(event) => setPickupDate(event.target.value)}
              />
            </label>
            <label>
              <span>Pickup window</span>
              <select value={pickupWindow} onChange={(event) => setPickupWindow(event.target.value as WindowKey)}>
                {pickupWindowOptions.map((windowKey) => (
                  <option key={windowKey} value={windowKey}>
                    {windowKey[0].toUpperCase() + windowKey.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="hero-actions sell-offer-actions">
            <button className="button button-secondary" type="button" onClick={acceptOffer} disabled={acceptLoading}>
              {acceptLoading ? 'Scheduling…' : 'Accept Offer + Schedule Pickup'}
            </button>
            <button className="button button-secondary" type="button" onClick={fetchStatus} disabled={statusLoading}>
              {statusLoading ? 'Checking…' : 'Check Status'}
            </button>
            <Link className="button button-primary" href="/sign-in?redirect_url=/sell-or-trade">
              Sign In for Full Lifecycle
            </Link>
          </div>

          {acceptError && <p className="sell-form-error">{acceptError}</p>}
          {acceptResult && (
            <p className="sell-form-success">
              Pickup {acceptResult.status}. Ref {acceptResult.externalReference ?? acceptResult.submissionId}.
            </p>
          )}

          {statusError && <p className="sell-form-error">{statusError}</p>}
          {statusResult && (
            <p className="sell-form-success">
              Current status: <strong>{statusResult.status}</strong>
              {statusResult.pickupDate ? ` · Pickup ${formatDate(statusResult.pickupDate)}` : ''}
              {statusResult.pickupWindow ? ` (${statusResult.pickupWindow})` : ''}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
