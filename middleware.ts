import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Routes that require a signed-in Clerk session.
 * All other routes remain public.
 *
 * Protected: /account, /saved, /profile
 * Public: /, /inventory/*, /finance, /purchase, /protection, /sign-in, /sign-up
 * API: /api/saved-vehicles requires auth (enforced inside the route handler via auth())
 *      All other API routes are server-to-server or public intake (enforced per-handler)
 */
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/saved(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
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
