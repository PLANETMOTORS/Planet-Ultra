// ============================================================
// Planet Motors — Shared Utilities
// ============================================================

export function slugify(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function buildVdpSlug(
  year: number, make: string, model: string, trim: string, stock: string
): string {
  const parts: (string | number)[] = [year, slugify(make), slugify(model)];
  if (trim) parts.push(slugify(trim));
  parts.push(stock.toLowerCase());
  return parts.join('-');
}

export function buildVdpPath(
  year: number, make: string, model: string, trim: string, stock: string
): string {
  return `/inventory/used/${slugify(make)}/${slugify(model)}/${buildVdpSlug(year, make, model, trim, stock)}/`;
}

export function estimateBiweekly(price: number): number {
  if (price <= 0) return 0;
  const rate    = 0.07 / 26;
  const periods = 156; // 72 months bi-weekly
  return Math.round((price * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1));
}

export function soldDaysAgo(soldAt?: string): number {
  if (!soldAt) return -1;
  return Math.floor((Date.now() - new Date(soldAt).getTime()) / 86_400_000);
}

export function getSoldPhase(status: string, soldAt?: string): 1 | 2 | 3 {
  if (status !== 'sold') return 1;
  const days = soldDaysAgo(soldAt);
  if (days < 0)    return 1;
  if (days <= 30)  return 2;
  return 3;
}

export function formatCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style:    'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(km: number): string {
  return `${km.toLocaleString('en-CA')} km`;
}

export function toISODate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}
