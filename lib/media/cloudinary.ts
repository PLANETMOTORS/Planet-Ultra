const DEFAULT_CLOUDINARY_HOST = 'res.cloudinary.com';

export const CLOUDINARY_ALLOWED_HOSTS = [DEFAULT_CLOUDINARY_HOST] as const;

export function isAllowedMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return CLOUDINARY_ALLOWED_HOSTS.includes(parsed.hostname as (typeof CLOUDINARY_ALLOWED_HOSTS)[number]);
  } catch {
    return false;
  }
}

export function safeCloudinaryMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return isAllowedMediaUrl(url) ? url : undefined;
}

export function filterAllowedMediaUrls(urls: string[]): string[] {
  return urls.filter((url) => isAllowedMediaUrl(url));
}

export function isSafeIframeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
