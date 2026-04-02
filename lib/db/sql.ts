import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export type DatabaseSql = NeonQueryFunction<false, false>;

function looksLikePlaceholderConnectionString(url: string): boolean {
  return (
    url.includes('[user]') ||
    url.includes('[password]') ||
    url.includes('[host]') ||
    url.includes('[dbname]')
  );
}

/**
 * Returns a Neon SQL executor when DATABASE_URL is set to a valid, non-placeholder URL.
 * Returns null for unset/invalid placeholder values so server components can fail soft.
 */
export function getDatabaseSql(): DatabaseSql | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (looksLikePlaceholderConnectionString(url)) return null;

  try {
    // Validate URL shape before passing to neon().
    // This prevents build-time crashes when env placeholders are checked in locally.
    new URL(url);
  } catch {
    return null;
  }

  try {
    return neon(url);
  } catch {
    return null;
  }
}
