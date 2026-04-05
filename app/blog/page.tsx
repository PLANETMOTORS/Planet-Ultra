import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/marketing/blog';

export const metadata: Metadata = {
  title: 'Planet Motors Blog',
  description:
    'Buying guides, trade-in insights, and financing tips from Planet Motors.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
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
            <Link href="/blog" aria-current="page">
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="flow-hero">
            <div>
              <p className="eyebrow">Insights</p>
              <h1>Planet Motors Blog</h1>
              <p className="muted">
                Practical guidance on buying, trading, financing, and protecting your next vehicle.
              </p>
            </div>
            <div className="flow-hero-kpis">
              <article>
                <strong>Weekly</strong>
                <span>Fresh buying and finance content</span>
              </article>
              <article>
                <strong>Practical</strong>
                <span>Actionable vehicle ownership advice</span>
              </article>
              <article>
                <strong>Transparent</strong>
                <span>Clear, no-fluff explanations</span>
              </article>
            </div>
          </div>

          <div className="blog-card-grid" style={{ marginTop: '14px' }}>
            {blogPosts.map((post) => (
              <article className="blog-card" key={post.slug}>
                <p className="eyebrow">{post.category}</p>
                <h2>{post.title}</h2>
                <p className="muted">{post.excerpt}</p>
                <p className="muted">
                  {post.readTimeMinutes} min read · {post.publishedAt}
                </p>
                <Link className="button button-secondary" href={`/blog/${post.slug}`}>
                  Read Article
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
