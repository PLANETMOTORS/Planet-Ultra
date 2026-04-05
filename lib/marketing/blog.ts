export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-buy-used-car-online-ontario',
    title: 'How To Buy a Used Car Online in Ontario',
    excerpt: 'A practical checklist for choosing, financing, and closing with confidence.',
    category: 'Buying Guide',
    publishedAt: '2026-04-05',
    readTimeMinutes: 6,
    body: [
      'Start with live inventory and compare total cost, not only monthly payment. Always confirm inspection, history, and return policy before reserve.',
      'Use pre-approval early. It gives budget clarity before emotionally committing to a specific vehicle.',
      'Finalize using secure checkout, then lock delivery or pickup window and keep all status updates in one timeline.',
    ],
  },
  {
    slug: 'trade-in-vs-private-sale',
    title: 'Trade-In vs Private Sale: Which Wins in 2026?',
    excerpt: 'When speed and certainty matter, trade-in often beats maximum headline price.',
    category: 'Trade-In',
    publishedAt: '2026-04-04',
    readTimeMinutes: 5,
    body: [
      'Private sale can return higher gross value, but requires listing, screening buyers, and payment risk management.',
      'Trade-in compresses time and risk by combining valuation, purchase credit, and logistics into one flow.',
      'If your top goal is fast transition to a new vehicle, trade-in lifecycle tools are the better path.',
    ],
  },
  {
    slug: 'vehicle-protection-plans-explained',
    title: 'Vehicle Protection Plans Explained',
    excerpt: 'Essential, Comprehensive, and Ultimate coverage in plain language.',
    category: 'Protection',
    publishedAt: '2026-04-03',
    readTimeMinutes: 4,
    body: [
      'Coverage should match usage pattern. High-mileage drivers usually benefit from broader electrical and mechanical coverage windows.',
      'Review deductible, term, and claim handling responsiveness, not just total plan price.',
      'A clean quote flow lets you compare options side-by-side before final purchase decision.',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}
