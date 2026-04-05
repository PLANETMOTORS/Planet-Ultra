import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPostBySlug } from '@/lib/marketing/blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Article Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <Link href="/">Planet Motors</Link>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/blog">Blog</Link>
            <Link href="/inventory">Inventory</Link>
            <Link href="/finance">Finance</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <article className="blog-post-shell">
            <p className="eyebrow">{post.category}</p>
            <h1>{post.title}</h1>
            <p className="muted">
              {post.readTimeMinutes} min read · {post.publishedAt}
            </p>
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="hero-actions">
              <Link className="button button-secondary" href="/blog">
                Back to Blog
              </Link>
              <Link className="button button-primary" href="/inventory">
                Shop Inventory
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
