import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';

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
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: '32px 16px',
      }}
    >
      <SignUp />
    </main>
  );
}
