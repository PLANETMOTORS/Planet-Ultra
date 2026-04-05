import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Planet Motors inventory, financing, trade-ins, checkout, and delivery.',
  alternates: { canonical: '/faq' },
};

const faqs = [
  {
    question: 'How often is inventory refreshed?',
    answer:
      'Inventory sync runs through snapshot imports and surfaces live cards in the listing and VDP routes.',
  },
  {
    question: 'Can I trade in my current vehicle?',
    answer:
      'Yes. Use the Sell or Trade flow to request an estimate, then accept and schedule pickup when ready.',
  },
  {
    question: 'Do I need to sign in before checkout?',
    answer:
      'Yes. Purchase submit boundaries require authenticated sessions before creating secure Stripe checkout sessions.',
  },
  {
    question: 'How does financing work?',
    answer:
      'Finance applications are submitted through server-side validation with lender relay lifecycle handling.',
  },
];

export default function FaqPage() {
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
            <Link href="/faq" aria-current="page">
              FAQ
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Support</p>
              <h1>Frequently Asked Questions</h1>
              <p className="muted">
                Quick answers for the most common questions about the Planet Motors digital buying
                and trade-in flow.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Inventory</strong>
                <span>Live snapshot-driven cards</span>
              </article>
              <article>
                <strong>Finance</strong>
                <span>Protected server submission</span>
              </article>
              <article>
                <strong>Trade-In</strong>
                <span>Offer and pickup lifecycle</span>
              </article>
            </div>
          </div>

          <div className="card-grid" style={{ marginTop: '14px' }}>
            {faqs.map((item) => (
              <article className="card" key={item.question}>
                <h2>{item.question}</h2>
                <p className="muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
