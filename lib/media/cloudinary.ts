/**
 * Cloudinary media runtime helpers.
 *
 * Rules:
 * - Cloudinary is the frontend media truth for all vehicle images.
 * - Images must be served via Cloudinary transformation URLs with explicit
 *   dimensions and format to avoid CLS and oversized payloads.
 * - The hero image (LCP candidate) must declare width/height for layout stability.
 * - No Cloudinary URLs are hardcoded here; they come from Postgres via Vehicle.heroImage.
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/**
 * Returns the Cloudinary base URL for the configured cloud.
 * If NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is unset this returns an empty string,
 * which signals that Cloudinary is not yet configured.
 */
export function cloudinaryBase(): string {
  if (!CLOUDINARY_CLOUD_NAME) return '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;
}

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  /** Defaults to 'fill' */
  crop?: string;
  /** Defaults to 'auto' (AVIF/WebP negotiation) */
  format?: string;
  /** Defaults to 'auto' */
  quality?: string;
  /** Gravity hint for smart crop */
  gravity?: string;
}

/**
 * Appends Cloudinary URL transformation parameters to a raw Cloudinary
 * delivery URL.  The URL is expected to contain /upload/ as a segment;
 * transformation params are injected after /upload/.
 *
 * If the URL does not contain /upload/ (e.g. a non-Cloudinary source)
 * the URL is returned as-is — this keeps the function safe to call even
 * when images come from a different origin during development.
 */
export function applyCloudinaryTransforms(
  url: string,
  options: CloudinaryTransformOptions = {},
): string {
  if (!url || !url.includes('/upload/')) return url;

  const {
    width,
    height,
    crop = 'fill',
    format = 'auto',
    quality = 'auto',
    gravity,
  } = options;

  const parts: string[] = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  parts.push(`c_${crop}`);
  parts.push(`f_${format}`);
  parts.push(`q_${quality}`);
  if (gravity) parts.push(`g_${gravity}`);

  const transform = parts.join(',');
  return url.replace('/upload/', `/upload/${transform}/`);
}

/**
 * Standard hero image transform for VDP LCP.
 * 1200×800 fill, auto format/quality, gravity auto (face/subject detection).
 */
export function heroImageUrl(rawUrl: string): string {
  return applyCloudinaryTransforms(rawUrl, {
    width: 1200,
    height: 800,
    crop: 'fill',
    gravity: 'auto',
  });
}

/**
 * Open Graph / Twitter social card image transform.
 * 1200×630 fill, JPEG format, quality auto, gravity auto.
 *
 * 1200×630 is the canonical OG social-card spec (1.91:1 ratio).
 * Format is forced to JPEG because some social scrapers (Facebook, iMessage)
 * do not honour AVIF/WebP Accept headers and will reject non-JPEG/PNG cards.
 * Gravity auto enables Cloudinary face/subject detection for best crop.
 */
export function socialCardImageUrl(rawUrl: string): string {
  return applyCloudinaryTransforms(rawUrl, {
    width: 1200,
    height: 630,
    crop: 'fill',
    format: 'jpg',
    quality: 'auto',
    gravity: 'auto',
  });
}

/** Declared dimensions for the OG social card — pass these to Next.js Metadata. */
export const SOCIAL_CARD_DIMS = { width: 1200, height: 630 } as const;

/**
 * Standard gallery thumbnail transform.
 * 600×400 fill, auto format/quality.
 */
export function galleryThumbUrl(rawUrl: string): string {
  return applyCloudinaryTransforms(rawUrl, {
    width: 600,
    height: 400,
    crop: 'fill',
  });
}

/**
 * Standard inventory card image transform.
 * 480×320 fill, auto format/quality.
 */
export function inventoryCardImageUrl(rawUrl: string): string {
  return applyCloudinaryTransforms(rawUrl, {
    width: 480,
    height: 320,
    crop: 'fill',
  });
}

/**
 * Returns the expected display dimensions for the hero image.
 * Used to set explicit width/height on <Image> to prevent CLS.
 */
export const HERO_IMAGE_DIMS = { width: 1200, height: 800 } as const;

/**
 * Returns the expected display dimensions for an inventory card image.
 */
export const CARD_IMAGE_DIMS = { width: 480, height: 320 } as const;
