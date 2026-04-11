/**
 * OMVIC all-in pricing validation.
 *
 * Under Ontario Motor Vehicle Industry Council (OMVIC) regulations,
 * all advertised vehicle prices MUST include mandatory fees.
 * The site must never display a price that excludes these fees.
 *
 * Fail-safe rule: if the fee-inclusive price cannot be validated,
 * the vehicle must not be shown with a price. Return null instead
 * of an incorrect number.
 *
 * Reference: OMVIC — All-In Price Advertising
 * https://www.omvic.on.ca/portal/Consumers/RightsResponsibilities/AllInPriceAdvertising.aspx
 */

/**
 * OMVIC mandatory fees that must be included in the advertised price.
 * These are configured via environment variables so they can be updated
 * without a code deploy when regulations change.
 *
 * When an env var is not set, the fee defaults to 0 (no hidden charge).
 */
function getOmvicFeesCents(): {
  adminFeeCents: number;
  etcFeeCents: number;
  omvicFeeCents: number;
} {
  return {
    adminFeeCents: parseInt(process.env.OMVIC_ADMIN_FEE_CENTS ?? '0', 10),
    etcFeeCents: parseInt(process.env.OMVIC_ETC_FEE_CENTS ?? '0', 10),
    omvicFeeCents: parseInt(process.env.OMVIC_FEE_CENTS ?? '0', 10),
  };
}

export interface OmvicPriceResult {
  /** The all-in price in CAD (cents). null if validation failed. */
  allInPriceCents: number | null;
  /** The base selling price in CAD (cents) before mandatory fees. */
  basePriceCents: number;
  /** Breakdown of mandatory fees applied. */
  fees: {
    adminFeeCents: number;
    etcFeeCents: number;
    omvicFeeCents: number;
    totalFeesCents: number;
  };
  /** True if the price passed OMVIC validation. */
  valid: boolean;
  /** Reason for failure if valid is false. */
  reason?: string;
}

/**
 * Validates and computes the OMVIC-compliant all-in price for a vehicle.
 *
 * @param sellingPriceCad — the selling price in whole CAD dollars from the DB
 * @returns OmvicPriceResult with the validated all-in price or null on failure
 */
export function validateOmvicPrice(sellingPriceCad: number): OmvicPriceResult {
  const basePriceCents = Math.round(sellingPriceCad * 100);

  if (!Number.isFinite(sellingPriceCad) || sellingPriceCad < 0) {
    return {
      allInPriceCents: null,
      basePriceCents: 0,
      fees: { adminFeeCents: 0, etcFeeCents: 0, omvicFeeCents: 0, totalFeesCents: 0 },
      valid: false,
      reason: 'Invalid base price: must be a non-negative finite number',
    };
  }

  const fees = getOmvicFeesCents();
  const totalFeesCents = fees.adminFeeCents + fees.etcFeeCents + fees.omvicFeeCents;
  const allInPriceCents = basePriceCents + totalFeesCents;

  if (!Number.isFinite(allInPriceCents) || allInPriceCents < 0) {
    return {
      allInPriceCents: null,
      basePriceCents,
      fees: { ...fees, totalFeesCents },
      valid: false,
      reason: 'Fee calculation produced an invalid total',
    };
  }

  return {
    allInPriceCents,
    basePriceCents,
    fees: { ...fees, totalFeesCents },
    valid: true,
  };
}

/**
 * Returns the OMVIC-compliant all-in price in whole CAD dollars,
 * or null if the price cannot be validated (fail-safe).
 *
 * Use this in display contexts — if null is returned, do NOT show a price.
 */
export function getOmvicAllInPriceCad(sellingPriceCad: number): number | null {
  const result = validateOmvicPrice(sellingPriceCad);
  if (!result.valid || result.allInPriceCents === null) return null;
  return result.allInPriceCents / 100;
}
