import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Routes that require a signed-in Clerk session.
 * All other routes remain public.
 *
 * Protected: /account, /saved, /profile
 * Public: /, /inventory/*, /finance, /purchase, /protection, /sign-in, /sign-up
 * API: /api/saved-vehicles requires auth (enforced inside the route handler via auth())
 *      All other API routes are server-to-server or public intake (enforced per-handler)
 *
 * Auth strategy: manual userId check + explicit NextResponse.redirect instead of
 * auth.protect(). This avoids Clerk's internal dev-mode rewrite which produces a
 * 404 when the __clerk_db_jwt browser cookie is absent (e.g. first load, curl).
 * With explicit redirect, unauthenticated requests always get a proper 302 to
 * /sign-in regardless of Clerk key mode (dev or production).
 */
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/saved(.*)',
  '/profile(.*)',
]);

const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in';

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL(SIGN_IN_URL, req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
