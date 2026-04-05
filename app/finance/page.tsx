import type { Metadata } from 'next';
import Link from 'next/link';
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
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <Link href="/finance" aria-current="page">
              Finance
            </Link>
            <a href="/protection">Protection</a>
          </nav>
        </div>
      </header>

      <section className="section finance-flow">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Finance Application</p>
              <h1>Apply for Financing</h1>
              <p className="muted">
                Fast online application with lender relay-ready backend. Our team follows up within
                one business day.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>5 min</strong>
                <span>Average application time</span>
              </article>
              <article>
                <strong>Secure</strong>
                <span>Server-side validation + rate limits</span>
              </article>
              <article>
                <strong>Live</strong>
                <span>Dealertrack/RouteOne lifecycle wiring</span>
              </article>
            </div>
          </div>

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
            <article className="flow-card">
              <h2>Application Shell</h2>
              <p className="muted">
                Complete the fields below and submit to the finance boundary route. PII is validated
                server-side and never written to Postgres.
              </p>

              {/* Non-functional shell fields for UX review; API route remains JSON boundary. */}
              <div className="flow-field-grid" aria-label="Finance form shell">
                <label>
                  <span>First name</span>
                  <input type="text" placeholder="John" readOnly />
                </label>
                <label>
                  <span>Last name</span>
                  <input type="text" placeholder="Doe" readOnly />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" placeholder="john@email.com" readOnly />
                </label>
                <label>
                  <span>Phone</span>
                  <input type="tel" placeholder="+1 (___) ___-____" readOnly />
                </label>
                <label>
                  <span>Down payment</span>
                  <input type="text" placeholder="$2,000" readOnly />
                </label>
                <label>
                  <span>Term</span>
                  <input type="text" placeholder="72 months" readOnly />
                </label>
              </div>

              <p className="muted flow-note">
                Finance submit boundary: <code>POST /api/finance/submit</code>
              </p>
            </article>

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
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Finance conversion flow shell with runtime-safe boundaries.</p>
          </div>
          <div className="footer-links">
            <Link href="/inventory">Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <Link href="/finance">Finance</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
