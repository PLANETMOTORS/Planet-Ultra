import { describe, it, expect } from 'vitest';
import {
  buildFinanceQuote,
  buildDefaultDealerFees,
  calculateMonthlyPayment,
  calculateBiweeklyPayment,
  calculateAmountFinanced,
  DEFAULT_ONTARIO_TAX_RATE_PERCENT,
  type FinanceQuoteInput,
  type FinanceLineItem,
} from '@/lib/finance/FinanceEngine';

// ---------------------------------------------------------------------------
// Helper: minimal valid input
// ---------------------------------------------------------------------------
function baseInput(overrides: Partial<FinanceQuoteInput> = {}): FinanceQuoteInput {
  return {
    vehiclePriceCad: 30000,
    annualRatePercent: 6.99,
    termMonths: 60,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Default dealer fees
// ---------------------------------------------------------------------------
describe('buildDefaultDealerFees', () => {
  it('returns 4 default Ontario fees', () => {
    const fees = buildDefaultDealerFees();
    expect(fees).toHaveLength(4);
    expect(fees.map((f) => f.code)).toEqual(['docs', 'certification', 'licence', 'omvic']);
  });

  it('uses correct default amounts', () => {
    const fees = buildDefaultDealerFees();
    const map = Object.fromEntries(fees.map((f) => [f.code, f]));
    expect(map['docs'].amountCad).toBe(895);
    expect(map['certification'].amountCad).toBe(595);
    expect(map['licence'].amountCad).toBe(59);
    expect(map['omvic'].amountCad).toBe(22);
  });

  it('licence is non-taxable by default', () => {
    const fees = buildDefaultDealerFees();
    const licence = fees.find((f) => f.code === 'licence')!;
    expect(licence.taxable).toBe(false);
  });

  it('all fees are enabled by default', () => {
    const fees = buildDefaultDealerFees();
    fees.forEach((f) => expect(f.enabled).toBe(true));
  });

  it('respects overrides', () => {
    const fees = buildDefaultDealerFees({ docsFeeCad: 500, licenceTaxable: true });
    const docs = fees.find((f) => f.code === 'docs')!;
    const licence = fees.find((f) => f.code === 'licence')!;
    expect(docs.amountCad).toBe(500);
    expect(licence.taxable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Basic quote building
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — basic', () => {
  it('returns vehiclePriceCad as provided', () => {
    const q = buildFinanceQuote(baseInput());
    expect(q.vehiclePriceCad).toBe(30000);
  });

  it('defaults to Ontario 13% tax', () => {
    const q = buildFinanceQuote(baseInput());
    expect(q.taxRatePercent).toBe(DEFAULT_ONTARIO_TAX_RATE_PERCENT);
  });

  it('includes default dealer fees when none provided', () => {
    const q = buildFinanceQuote(baseInput());
    expect(q.dealerFees).toHaveLength(4);
    // docs(895) + cert(595) + licence(59) + omvic(22) = 1571
    expect(q.dealerFeesCad).toBe(1571);
  });

  it('calculates taxable subtotal correctly', () => {
    const q = buildFinanceQuote(baseInput());
    // vehicle 30000 + taxable fees (docs 895 + cert 595 + omvic 22) = 31512
    // licence is non-taxable
    expect(q.taxableSubtotalCad).toBe(31512);
  });

  it('calculates tax correctly', () => {
    const q = buildFinanceQuote(baseInput());
    // 31512 * 0.13 = 4096.56
    expect(q.taxCad).toBe(4096.56);
  });

  it('calculates subtotal before tax correctly', () => {
    const q = buildFinanceQuote(baseInput());
    // 30000 + 1571 + 0 delivery + 0 fi = 31571
    expect(q.subtotalBeforeTaxCad).toBe(31571);
  });

  it('calculates out-the-door total correctly', () => {
    const q = buildFinanceQuote(baseInput());
    // subtotal 31571 + tax 4096.56 = 35667.56
    expect(q.outTheDoorTotalCad).toBe(35667.56);
  });

  it('monthly payment is positive for financed amount > 0', () => {
    const q = buildFinanceQuote(baseInput());
    expect(q.monthlyPaymentCad).toBeGreaterThan(0);
  });

  it('biweekly = (monthly * 12) / 26', () => {
    const q = buildFinanceQuote(baseInput());
    const expected = Number(((q.monthlyPaymentCad * 12) / 26).toFixed(2));
    expect(q.biweeklyPaymentCad).toBe(expected);
  });

  it('total interest = totalOfPayments - amountFinanced', () => {
    const q = buildFinanceQuote(baseInput());
    expect(q.totalInterestCad).toBe(
      Number((q.totalOfPaymentsCad - q.amountFinancedCad).toFixed(2)),
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Down payment
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — down payment', () => {
  it('reduces amount financed by down payment', () => {
    const withoutDown = buildFinanceQuote(baseInput());
    const withDown = buildFinanceQuote(baseInput({ downPaymentCad: 5000 }));
    expect(withDown.amountFinancedCad).toBeCloseTo(withoutDown.amountFinancedCad - 5000, 2);
  });

  it('negative down payment is sanitised to 0', () => {
    const q = buildFinanceQuote(baseInput({ downPaymentCad: -500 }));
    expect(q.downPaymentCad).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Trade-in
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — trade-in', () => {
  it('positive equity reduces amount financed', () => {
    const noTrade = buildFinanceQuote(baseInput());
    const withTrade = buildFinanceQuote(
      baseInput({ tradeInValueCad: 8000, tradeInPayoffCad: 3000 }),
    );
    // trade equity = 5000
    expect(withTrade.tradeEquityCad).toBe(5000);
    expect(withTrade.negativeEquityCad).toBe(0);
    expect(withTrade.amountFinancedCad).toBeCloseTo(noTrade.amountFinancedCad - 5000, 2);
  });

  it('negative equity increases amount financed', () => {
    const noTrade = buildFinanceQuote(baseInput());
    const withNeg = buildFinanceQuote(
      baseInput({ tradeInValueCad: 3000, tradeInPayoffCad: 8000 }),
    );
    // negative equity = 5000
    expect(withNeg.negativeEquityCad).toBe(5000);
    expect(withNeg.tradeEquityCad).toBe(0);
    expect(withNeg.amountFinancedCad).toBeCloseTo(noTrade.amountFinancedCad + 5000, 2);
  });

  it('trade-in tax credit reduces taxable subtotal', () => {
    const q = buildFinanceQuote(
      baseInput({ tradeInValueCad: 5000, tradeInTaxCreditCad: 5000 }),
    );
    // taxableSubtotal = vehicle(30000) + taxable fees(1512) - credit(5000) = 26512
    expect(q.taxableSubtotalCad).toBe(26512);
  });

  it('trade-in tax credit is capped at vehicle price', () => {
    const q = buildFinanceQuote(
      baseInput({ tradeInTaxCreditCad: 99999 }),
    );
    expect(q.tradeInTaxCreditCad).toBe(30000); // capped at vehiclePriceCad
  });
});

// ---------------------------------------------------------------------------
// 5. Zero interest (cash deal)
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — 0% interest', () => {
  it('monthly payment = principal / termMonths', () => {
    const q = buildFinanceQuote(baseInput({ annualRatePercent: 0 }));
    const expected = Number((q.amountFinancedCad / q.termMonths).toFixed(2));
    expect(q.monthlyPaymentCad).toBe(expected);
  });

  it('total interest is negligible (rounding artifact at most)', () => {
    const q = buildFinanceQuote(baseInput({ annualRatePercent: 0 }));
    expect(q.totalInterestCad).toBeCloseTo(0, 1);
  });
});

// ---------------------------------------------------------------------------
// 6. Delivery & F&I products
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — delivery and F&I', () => {
  it('includes delivery fee when enabled', () => {
    const q = buildFinanceQuote(
      baseInput({ deliveryFeeCad: 500, includeDelivery: true }),
    );
    expect(q.deliveryFeeCad).toBe(500);
    expect(q.deliveryLineItem).not.toBeNull();
    expect(q.deliveryLineItem!.enabled).toBe(true);
  });

  it('delivery is non-taxable by default', () => {
    const q = buildFinanceQuote(
      baseInput({ deliveryFeeCad: 500, includeDelivery: true }),
    );
    expect(q.deliveryLineItem!.taxable).toBe(false);
  });

  it('delivery can be taxable', () => {
    const q = buildFinanceQuote(
      baseInput({ deliveryFeeCad: 500, includeDelivery: true, deliveryFeeTaxable: true }),
    );
    expect(q.deliveryLineItem!.taxable).toBe(true);
  });

  it('F&I products are summed into subtotal', () => {
    const products: FinanceLineItem[] = [
      { code: 'gap', label: 'GAP Insurance', amountCad: 1200, taxable: true },
      { code: 'ext-warranty', label: 'Extended Warranty', amountCad: 2500, taxable: true },
    ];
    const q = buildFinanceQuote(baseInput({ fiProducts: products }));
    expect(q.fiProductsCad).toBe(3700);
  });

  it('disabled F&I products are excluded', () => {
    const products: FinanceLineItem[] = [
      { code: 'gap', label: 'GAP', amountCad: 1200, taxable: true, enabled: true },
      { code: 'ext', label: 'Ext Warranty', amountCad: 2500, taxable: true, enabled: false },
    ];
    const q = buildFinanceQuote(baseInput({ fiProducts: products }));
    expect(q.fiProductsCad).toBe(1200);
  });
});

// ---------------------------------------------------------------------------
// 7. Custom tax rate
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — custom tax rate', () => {
  it('uses provided tax rate instead of Ontario default', () => {
    const q = buildFinanceQuote(baseInput({ taxRatePercent: 5 }));
    expect(q.taxRatePercent).toBe(5);
    // tax should be lower than at 13%
    const ontarioQ = buildFinanceQuote(baseInput());
    expect(q.taxCad).toBeLessThan(ontarioQ.taxCad);
  });
});

// ---------------------------------------------------------------------------
// 8. Edge cases
// ---------------------------------------------------------------------------
describe('buildFinanceQuote — edge cases', () => {
  it('amount financed cannot go below 0', () => {
    const q = buildFinanceQuote(
      baseInput({ downPaymentCad: 999999 }),
    );
    expect(q.amountFinancedCad).toBe(0);
    expect(q.monthlyPaymentCad).toBe(0);
  });

  it('handles 1-month term', () => {
    const q = buildFinanceQuote(baseInput({ termMonths: 1 }));
    expect(q.termMonths).toBe(1);
    expect(q.monthlyPaymentCad).toBeGreaterThan(0);
  });

  it('handles negative vehicle price (sanitised to 0)', () => {
    const q = buildFinanceQuote(baseInput({ vehiclePriceCad: -5000 }));
    expect(q.vehiclePriceCad).toBe(0);
  });

  it('all money values are rounded to 2 decimal places', () => {
    const q = buildFinanceQuote(baseInput({ vehiclePriceCad: 33333.333 }));
    const twoDecimalPattern = /^\d+(\.\d{1,2})?$/;
    expect(String(q.monthlyPaymentCad)).toMatch(twoDecimalPattern);
    expect(String(q.taxCad)).toMatch(twoDecimalPattern);
    expect(String(q.totalInterestCad)).toMatch(twoDecimalPattern);
  });
});

// ---------------------------------------------------------------------------
// 9. Convenience functions
// ---------------------------------------------------------------------------
describe('convenience functions', () => {
  it('calculateMonthlyPayment matches buildFinanceQuote', () => {
    const input = baseInput();
    expect(calculateMonthlyPayment(input)).toBe(buildFinanceQuote(input).monthlyPaymentCad);
  });

  it('calculateBiweeklyPayment matches buildFinanceQuote', () => {
    const input = baseInput();
    expect(calculateBiweeklyPayment(input)).toBe(buildFinanceQuote(input).biweeklyPaymentCad);
  });

  it('calculateAmountFinanced matches buildFinanceQuote', () => {
    const input = baseInput();
    expect(calculateAmountFinanced(input)).toBe(buildFinanceQuote(input).amountFinancedCad);
  });
});
