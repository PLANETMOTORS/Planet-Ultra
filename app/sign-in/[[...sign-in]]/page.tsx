import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { hasValidClerkPublishableKey } from '@/lib/auth/clerkConfig';

/**
 * /sign-in — Clerk-hosted sign-in.
 * Catch-all route required by Clerk for OAuth callback handling.
 * noindex: this page must not appear in search results.
 */
export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  const clerkEnabled = hasValidClerkPublishableKey(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: '32px 16px',
      }}
    >
      {clerkEnabled ? (
        <SignIn />
      ) : (
        <div className="card" style={{ maxWidth: '520px', width: '100%' }}>
          <h1 style={{ marginTop: 0 }}>Sign In</h1>
          <p className="muted">
            Authentication is temporarily unavailable because Clerk keys are not configured.
          </p>
          <p className="muted">
            Set a valid <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and reload.
          </p>
          <Link className="button button-secondary" href="/">
            Return Home
          </Link>
        </div>
      )}
    </main>
  );
}
