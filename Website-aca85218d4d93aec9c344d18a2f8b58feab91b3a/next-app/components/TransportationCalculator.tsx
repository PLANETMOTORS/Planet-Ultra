'use client';

/**
 * TransportationCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in React component for Planet Motors.
 * Estimates vehicle delivery cost from Richmond Hill, ON (L4C 1G7) to any
 * Canadian destination postal code using real driving distance.
 *
 * INTEGRATION — add to any page or component:
 *
 *   import TransportationCalculator from '@/components/TransportationCalculator';
 *   ...
 *   <TransportationCalculator />
 *
 * DEPENDENCIES — none beyond React (already in project).
 * STYLES — fully scoped with .tc- prefix; will not affect global styles.css.
 * API — calls /api/distance (see app/api/distance/route.ts).
 * ENV — requires GOOGLE_MAPS_API_KEY set server-side (not in browser).
 */

import { useState, useRef, type FormEvent } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const ORIGIN_POSTAL  = 'L4C 1G7';
const ORIGIN_LABEL   = 'Richmond Hill, Ontario';
const DISCLAIMER     =
  'Transportation costs are estimated from Richmond Hill, Ontario (L4C\u00A01G7). ' +
  'Final delivery charges may vary depending on season, route, carrier availability, ' +
  'vehicle type, and destination access.';

// Canadian postal code: A1A 1A1 or A1A1A1
const POSTAL_RE = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

// ── Pricing logic (matches spec exactly) ─────────────────────────────────────
function calculateTransportCost(distanceKm: number): number {
  if (distanceKm <= 300) return 0;
  if (distanceKm <= 499) return (distanceKm - 300) * 0.70;
  if (distanceKm <= 999) return (distanceKm - 300) * 0.75;
  if (distanceKm <= 2000) return (distanceKm - 300) * 0.85;
  return (distanceKm - 300) * 0.60;
}

function formatCAD(amount: number): string {
  return amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface CalcResult {
  distanceKm:  number;
  cost:        number;
  destination: string; // normalised postal code shown in the result card
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TransportationCalculator() {
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<CalcResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalise postal code: uppercase, O→0 and I→1 in digit positions, space after 3rd char.
  // Canada Post never uses O or I in postal codes (confused with 0 and 1),
  // so silently correcting them avoids unnecessary validation errors.
  function normalise(raw: string): string {
    const chars = raw.toUpperCase().replace(/\s/g, '').split('');
    ([1, 3, 5] as const).forEach(i => {
      if (chars[i] === 'O') chars[i] = '0';
      if (chars[i] === 'I') chars[i] = '1';
    });
    const clean = chars.join('');
    return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setError(null);

    const trimmed = input.trim();
    const formatted = normalise(trimmed);

    // Client-side validation after normalisation
    if (!POSTAL_RE.test(formatted.replace(' ', ''))) {
      setError('Please enter a valid Canadian postal code.');
      inputRef.current?.focus();
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(
        `/api/distance?destination=${encodeURIComponent(formatted)}`
      );
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(
          'We could not calculate delivery cost at this time. ' +
          'Please try again or contact us for a quote.'
        );
        return;
      }

      setResult({
        distanceKm:  json.distanceKm,
        cost:        calculateTransportCost(json.distanceKm),
        destination: formatted,
      });
    } catch {
      setError(
        'We could not calculate delivery cost at this time. ' +
        'Please try again or contact us for a quote.'
      );
    } finally {
      setLoading(false);
    }
  }

  const isFree = result && result.distanceKm <= 300;

  return (
    <>
      {/* ── Scoped styles ── All classes prefixed .tc- to avoid any global conflict */}
      <style>{`
        .tc-wrap {
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          padding: 28px 24px 24px;
          max-width: 520px;
          width: 100%;
          box-sizing: border-box;
        }
        .tc-heading {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .tc-subheading {
          font-size: 13.5px;
          color: #6b7280;
          margin: 0 0 20px;
        }
        .tc-form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tc-input {
          flex: 1;
          min-width: 160px;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1f2937;
          outline: none;
          transition: border-color 0.15s;
          background: #fff;
        }
        .tc-input:focus {
          border-color: #223c79;
        }
        .tc-input::placeholder {
          color: #9ca3af;
        }
        .tc-btn {
          background: #223c79;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tc-btn:hover:not(:disabled) {
          background: #2a4a94;
        }
        .tc-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .tc-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: tc-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes tc-spin {
          to { transform: rotate(360deg); }
        }
        .tc-error {
          margin-top: 12px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #b91c1c;
        }
        .tc-result {
          margin-top: 16px;
          background: #f4f5f7;
          border-radius: 10px;
          padding: 16px 18px;
        }
        .tc-result-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 13.5px;
          color: #6b7280;
          padding: 4px 0;
          border-bottom: 1px solid #eaecf0;
        }
        .tc-result-row:last-of-type {
          border-bottom: none;
        }
        .tc-result-label {
          font-weight: 500;
          color: #6b7280;
        }
        .tc-result-value {
          font-weight: 600;
          color: #1f2937;
          text-align: right;
        }
        .tc-cost-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #eaecf0;
        }
        .tc-cost-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #1f2937;
        }
        .tc-cost-free {
          font-size: 20px;
          font-weight: 800;
          color: #15803d;
        }
        .tc-cost-amount {
          font-size: 20px;
          font-weight: 800;
          color: #223c79;
        }
        .tc-disclaimer {
          margin-top: 12px;
          font-size: 11.5px;
          color: #9ca3af;
          line-height: 1.5;
        }
        @media (max-width: 480px) {
          .tc-wrap {
            padding: 20px 16px;
          }
          .tc-form {
            flex-direction: column;
          }
          .tc-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="tc-wrap">
        <p className="tc-heading">Delivery Cost Estimator</p>
        <p className="tc-subheading">
          Enter a Canadian postal code to estimate shipping from{' '}
          {ORIGIN_POSTAL}, {ORIGIN_LABEL}.
        </p>

        <form className="tc-form" onSubmit={handleSubmit} noValidate>
          <input
            ref={inputRef}
            className="tc-input"
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            maxLength={7}
            placeholder="Enter delivery postal code"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Destination postal code"
            disabled={loading}
          />
          <button
            className="tc-btn"
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Calculate delivery cost"
          >
            {loading && <span className="tc-spinner" aria-hidden="true" />}
            {loading ? 'Calculating…' : 'Calculate Delivery'}
          </button>
        </form>

        {/* Error state */}
        {error && (
          <div className="tc-error" role="alert">
            {error}
          </div>
        )}

        {/* Result card */}
        {result && !error && (
          <div className="tc-result" aria-live="polite">
            <div className="tc-result-row">
              <span className="tc-result-label">Origin</span>
              <span className="tc-result-value">
                {ORIGIN_POSTAL}, {ORIGIN_LABEL}
              </span>
            </div>
            <div className="tc-result-row">
              <span className="tc-result-label">Destination</span>
              <span className="tc-result-value">{result.destination}</span>
            </div>
            <div className="tc-result-row">
              <span className="tc-result-label">Driving distance</span>
              <span className="tc-result-value">
                {result.distanceKm.toLocaleString('en-CA')} km
              </span>
            </div>

            {/* Cost — prominent row */}
            <div className="tc-cost-row">
              <span className="tc-cost-label">Estimated Delivery Cost</span>
              {isFree ? (
                <span className="tc-cost-free">Free Delivery</span>
              ) : (
                <span className="tc-cost-amount">{formatCAD(result.cost)}</span>
              )}
            </div>

            <p className="tc-disclaimer">{DISCLAIMER}</p>
          </div>
        )}
      </div>
    </>
  );
}
