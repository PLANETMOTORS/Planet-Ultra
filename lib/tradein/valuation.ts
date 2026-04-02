/**
 * Deterministic trade-in estimator for A6 lifecycle baseline.
 * This is intentionally conservative and transparent, and can be replaced
 * later by HomeNet/market-backed valuation services.
 */

type Condition = 'excellent' | 'good' | 'fair' | 'poor';

const BASE_MSRP_BY_BODY: Record<string, number> = {
  sedan: 32000,
  suv: 41000,
  truck: 46000,
  coupe: 35000,
  hatchback: 29000,
  default: 34000,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function conditionFactor(condition: Condition): number {
  const table: Record<Condition, number> = {
    excellent: 0.95,
    good: 0.88,
    fair: 0.78,
    poor: 0.62,
  };
  return table[condition];
}

export function estimateTradeInOffer(args: {
  year: number;
  mileageKm: number;
  condition: Condition;
  bodyStyle?: string;
  accidentsReported?: number;
}): number {
  const currentYear = new Date().getFullYear();
  const age = clamp(currentYear - args.year, 0, 25);
  const baseMsrp =
    BASE_MSRP_BY_BODY[(args.bodyStyle ?? '').toLowerCase()] ??
    BASE_MSRP_BY_BODY.default;

  // Age curve: steeper in first 5 years, flatter afterwards.
  const ageFactor = age <= 5 ? Math.pow(0.85, age) : Math.pow(0.85, 5) * Math.pow(0.94, age - 5);

  // Mileage normalization around 20,000 km/year.
  const expectedMileage = Math.max(1, age * 20000);
  const mileageRatio = args.mileageKm / expectedMileage;
  const mileageFactor = clamp(1.08 - (mileageRatio - 1) * 0.2, 0.55, 1.12);

  const accidentPenalty = clamp(1 - (args.accidentsReported ?? 0) * 0.08, 0.65, 1);

  const estimated = baseMsrp * ageFactor * mileageFactor * conditionFactor(args.condition) * accidentPenalty;
  // Keep floor for salvage-equivalent low-end values.
  return roundMoney(clamp(estimated, 1500, 120000));
}
