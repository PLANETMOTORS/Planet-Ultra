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
  const search = new URLSearchParams(params).toString();
  const signInUrl = `/sign-in?redirect_url=/purchase?${search}`;

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
            <a href="/finance">Finance</a>
            <Link href="/purchase" aria-current="page">
              Purchase
            </Link>
          </nav>
        </div>
      </header>

      <section className="section purchase-flow">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Secure Checkout Flow</p>
              <h1>Start Purchase</h1>
              <p className="muted">
                Reserve your vehicle with a secure refundable deposit. Checkout creation is handled
                server-side with Stripe session safety and lifecycle logging.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Auth</strong>
                <span>Clerk-protected checkout creation</span>
              </article>
              <article>
                <strong>Stripe</strong>
                <span>Server-only secret key handling</span>
              </article>
              <article>
                <strong>10-Day</strong>
                <span>Return/refund lifecycle supported</span>
              </article>
            </div>
          </div>

          {ctx ? (
            <>
              <article className="flow-context-card">
                <p className="eyebrow">Securing</p>
                <h2>
                  {ctx.vehicleYear} {ctx.vehicleMake} {ctx.vehicleModel}
                </h2>
                <p className="muted">
                  Listed at ${ctx.vehiclePriceCad.toLocaleString('en-CA')}
                </p>
              </article>

              {!userId && (
                <article className="flow-card purchase-auth-card">
                  <h2>Sign In Required</h2>
                  <p className="muted">
                    Please sign in to create a deposit checkout session for this vehicle.
                  </p>
                  <a className="button button-primary" href={signInUrl}>
                    Sign In to Continue
                  </a>
                </article>
              )}

              {userId && (
                <div className="flow-grid">
                  <article className="flow-card">
                    <h2>Deposit Checkout</h2>
                    <p className="muted">
                      A refundable deposit secures this vehicle for you. Checkout session creation is
                      routed through <code>POST /api/purchase/submit</code>.
                    </p>
                    <div className="flow-field-grid" aria-label="Purchase checkout shell">
                      <label>
                        <span>Vehicle ID</span>
                        <input type="text" value={ctx.vehicleId} readOnly />
                      </label>
                      <label>
                        <span>Vehicle Slug</span>
                        <input type="text" value={ctx.vehicleSlug} readOnly />
                      </label>
                    </div>
                    <p className="muted flow-note">
                      Live Stripe redirect CTA wiring is next runtime step after env closeout.
                    </p>
                  </article>

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
              )}
            </>
          ) : (
            <article className="flow-card">
              <h2>No Vehicle Selected</h2>
              <p className="muted">
                Please <Link href="/inventory">browse inventory</Link> and use the purchase button on
                a vehicle detail page.
              </p>
            </article>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Purchase flow shell with auth-aware checkout states.</p>
          </div>
          <div className="footer-links">
            <Link href="/inventory">Inventory</Link>
            <a href="/sell-or-trade">Sell or Trade</a>
            <a href="/finance">Finance</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
