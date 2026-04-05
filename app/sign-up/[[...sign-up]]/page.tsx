import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { hasValidClerkPublishableKey } from '@/lib/auth/clerkConfig';

/**
 * /sign-up — Clerk-hosted sign-up.
 * Catch-all route required by Clerk for OAuth callback handling.
 * noindex: this page must not appear in search results.
 */
export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
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
        <SignUp />
      ) : (
        <div className="card" style={{ maxWidth: '520px', width: '100%' }}>
          <h1 style={{ marginTop: 0 }}>Create Account</h1>
          <p className="muted">
            Sign-up is temporarily unavailable because Clerk keys are not configured.
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
