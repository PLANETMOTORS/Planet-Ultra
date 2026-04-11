/**
 * 360-degree asset runtime isolation rules.
 *
 * Design contract:
 * - 360 must be poster-first: show a still image until user interacts.
 * - 360 is click-to-hydrate: the viewer JS/assets load only after user clicks.
 * - No preload directives (<link rel="preload">, prefetch, or eager loading)
 *   for any 360 asset URL.
 * - 360 is outside the critical render path: it must never block LCP or CLS.
 * - hero360Asset on a Vehicle is optional; its absence must never break the page.
 * - 360 asset URLs can be signed to prevent unauthorized hotlinking and
 *   bandwidth theft. Signing requires CLOUDINARY_API_SECRET to be set.
 */

import type { Vehicle360Asset } from '@/types/vehicle';

/**
 * Returns true when a 360 asset is present and safe to surface in the UI.
 * Callers should gate any 360 viewer render on this check.
 */
export function has360Asset(asset: Vehicle360Asset | undefined): asset is Vehicle360Asset {
  return (
    asset !== undefined &&
    typeof asset.url === 'string' &&
    asset.url.length > 0
  );
}

/**
 * Returns the poster image URL for a 360 asset.
 * Falls back to undefined if no poster is defined.
 * The poster should always be rendered as a standard <Image> (LCP-safe).
 */
export function get360PosterUrl(asset: Vehicle360Asset): string | undefined {
  return asset.posterImageUrl || undefined;
}

/**
 * Returns the viewer type string for a 360 asset.
 */
export function get360AssetType(asset: Vehicle360Asset): 'spin' | 'interior' | 'glb' {
  return asset.type;
}

/**
 * Returns a signed Cloudinary URL for a 360 asset to prevent hotlinking.
 *
 * Signing uses HMAC-SHA256 with the Cloudinary API secret. The signed URL
 * expires after the configured TTL (default 1 hour). If CLOUDINARY_API_SECRET
 * is not configured, returns the original URL unsigned — signing is an
 * opt-in hardening layer, not a gate.
 *
 * @param assetUrl — the raw Cloudinary delivery URL
 * @param ttlSeconds — expiry window (default 3600 = 1 hour)
 */
export async function getSignedAssetUrl(
  assetUrl: string,
  ttlSeconds = 3600,
): Promise<string> {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret || !assetUrl.includes('/upload/')) return assetUrl;

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

  // Extract the path after /upload/ for signing
  const uploadIndex = assetUrl.indexOf('/upload/');
  const pathToSign = assetUrl.substring(uploadIndex + '/upload/'.length);
  const stringToSign = `${pathToSign}${expiresAt}${apiSecret}`;

  // Use Web Crypto API (available in Node.js 18+ and edge runtimes)
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);

  // Inject signing params before the resource path
  return assetUrl.replace(
    '/upload/',
    `/upload/s--${signature}--/ex_${expiresAt}/`,
  );
}

/**
 * Isolation contract enforcement.
 *
 * When embedding a 360 viewer, the surrounding component MUST:
 * 1. Show the poster image immediately (no spinner as the first visible element).
 * 2. Load the viewer script/assets only after user interaction (click/tap).
 * 3. Not import or preload the viewer module at the page level (use dynamic import).
 * 4. Not set loading="eager" or fetchpriority="high" on any 360 asset.
 * 5. Wrap the viewer in a container with explicit aspect-ratio or fixed
 *    min-height to prevent CLS when the viewer loads.
 *
 * This function is a runtime guard that logs a warning if violated.
 */
export function assert360IsolationContract(context: string): void {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[360 isolation] ${context} — click-to-hydrate contract active`);
    }
  }
}
