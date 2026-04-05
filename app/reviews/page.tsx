import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Read customer reviews for Planet Motors and see why buyers choose our digital-first vehicle purchase experience.',
  alternates: { canonical: '/reviews' },
};

const reviewItems = [
  {
    name: 'Sarah T.',
    title: 'Fast Trade-In and Smooth Delivery',
    quote:
      'Offer came quickly, pickup was exactly on time, and the full process felt transparent start to finish.',
  },
  {
    name: 'Marco L.',
    title: 'Finance Process Was Clear',
    quote:
      'The application was simple and I got follow-up quickly with options that matched my budget.',
  },
  {
    name: 'Daniel K.',
    title: 'Best Online Car Buying Experience',
    quote:
      'Inventory details were accurate, checkout was secure, and communication was great after payment.',
  },
];

export default function ReviewsPage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/inventory">Shop Inventory</Link>
            <Link href="/sell-or-trade">Sell or Trade</Link>
            <Link href="/finance">Finance</Link>
            <Link href="/reviews" aria-current="page">
              Reviews
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Social Proof</p>
              <h1>Customer Reviews</h1>
              <p className="muted">
                Real buyer feedback across inventory, finance, and delivery experiences.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>4.9/5</strong>
                <span>Average satisfaction score</span>
              </article>
              <article>
                <strong>Fast</strong>
                <span>Response and close cycle</span>
              </article>
              <article>
                <strong>Clear</strong>
                <span>No hidden process steps</span>
              </article>
            </div>
          </div>

          <div className="card-grid three-up" style={{ marginTop: '14px' }}>
            {reviewItems.map((item) => (
              <article className="card" key={item.name}>
                <p className="eyebrow">{item.name}</p>
                <h2>{item.title}</h2>
                <p className="muted">&ldquo;{item.quote}&rdquo;</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
