/**
 * Clerk env safety helpers.
 *
 * These checks prevent runtime crashes caused by placeholder/malformed keys
 * while keeping auth behavior explicit.
 */

export function hasValidClerkPublishableKey(
  value: string | undefined | null,
): boolean {
  if (!value) return false;
  const key = value.trim();
  if (key.length < 20) return false;
  if (!/^pk_(test|live)_/.test(key)) return false;
  if (key.endsWith('_')) return false;
  if (/placeholder|your_|replace|example/i.test(key)) return false;
  return true;
}
