/**
 * CTA context propagation.
 *
 * Vehicle context must survive route transitions (VDP → finance, purchase,
 * trade) without putting business logic in the UI.
 *
 * Strategy: context is carried as URL search params on server-rendered links.
 * The downstream page reads params server-side and pre-fills the form shell.
 * No client-side state, no localStorage, no React context for this data.
 *
 * Params carried:
 *   vid   — vehicleId
 *   slug  — vehicleSlug
 *   year  — vehicleYear
 *   make  — vehicleMake
 *   model — vehicleModel
 *   price — vehiclePriceCad (integer, for display only — no pricing logic in UI)
 */

export interface VehicleCtaContext {
  vehicleId: string;
  vehicleSlug: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePriceCad: number;
}

/**
 * Builds the URL for the "Apply for Financing" CTA with vehicle context
 * encoded as search params.
 */
export function buildFinanceCtaUrl(ctx: VehicleCtaContext): string {
  const params = new URLSearchParams({
    vid: ctx.vehicleId,
    slug: ctx.vehicleSlug,
    year: String(ctx.vehicleYear),
    make: ctx.vehicleMake,
    model: ctx.vehicleModel,
    price: String(ctx.vehiclePriceCad),
  });
  return `/finance?${params.toString()}`;
}

/**
 * Builds the URL for the "Start Purchase / Deposit" CTA with vehicle context.
 */
export function buildPurchaseCtaUrl(ctx: VehicleCtaContext): string {
  const params = new URLSearchParams({
    vid: ctx.vehicleId,
    slug: ctx.vehicleSlug,
    year: String(ctx.vehicleYear),
    make: ctx.vehicleMake,
    model: ctx.vehicleModel,
    price: String(ctx.vehiclePriceCad),
  });
  return `/purchase?${params.toString()}`;
}

/**
 * Builds the URL for the "Value Your Trade" CTA with vehicle context.
 */
export function buildTradeCtaUrl(ctx: VehicleCtaContext): string {
  const params = new URLSearchParams({
    vid: ctx.vehicleId,
    slug: ctx.vehicleSlug,
    year: String(ctx.vehicleYear),
    make: ctx.vehicleMake,
    model: ctx.vehicleModel,
    price: String(ctx.vehiclePriceCad),
  });
  return `/sell-or-trade?${params.toString()}`;
}

/**
 * Parses vehicle context from URL search params (server-side only).
 * Returns null if any required param is missing or invalid.
 */
export function parseVehicleCtaContext(
  searchParams: URLSearchParams | Record<string, string>,
): VehicleCtaContext | null {
  const get = (k: string) =>
    searchParams instanceof URLSearchParams
      ? searchParams.get(k)
      : searchParams[k];

  const vid = get('vid');
  const slug = get('slug');
  const yearStr = get('year');
  const make = get('make');
  const model = get('model');
  const priceStr = get('price');

  if (!vid || !slug || !yearStr || !make || !model || !priceStr) return null;

  const year = parseInt(yearStr, 10);
  const price = parseInt(priceStr, 10);

  if (isNaN(year) || isNaN(price) || year < 1900 || price <= 0) return null;

  return {
    vehicleId: vid,
    vehicleSlug: slug,
    vehicleYear: year,
    vehicleMake: make,
    vehicleModel: model,
    vehiclePriceCad: price,
  };
}
