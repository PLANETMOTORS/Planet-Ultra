export interface FinanceLineItem {
  code: string;
  label: string;
  amountCad: number;
  taxable: boolean;
  enabled?: boolean;
  category?: 'dealer_fee' | 'delivery' | 'fi_product';
}

export interface DealerFeeOverrides {
  docsFeeCad?: number;
  docsTaxable?: boolean;
  docsEnabled?: boolean;

  certificationFeeCad?: number;
  certificationTaxable?: boolean;
  certificationEnabled?: boolean;

  licenceFeeCad?: number;
  licenceTaxable?: boolean;
  licenceEnabled?: boolean;

  omvicFeeCad?: number;
  omvicTaxable?: boolean;
  omvicEnabled?: boolean;
}

export interface FinanceQuoteInput {
  vehiclePriceCad: number;
  downPaymentCad?: number;
  annualRatePercent: number;
  termMonths: number;

  /**
   * Ontario default is 13, but leave configurable.
   */
  taxRatePercent?: number;

  /**
   * Trade-in numbers.
   */
  tradeInValueCad?: number;
  tradeInPayoffCad?: number;

  /**
   * Keep this configurable instead of hardcoding province-specific trade tax rules.
   * Example: if your deal structure allows tax relief on trade value, populate this from
   * the upstream deal builder / province-specific tax logic.
   */
  tradeInTaxCreditCad?: number;

  /**
   * Dealer fees.
   */
  dealerFees?: FinanceLineItem[];

  /**
   * Delivery / transportation.
   * Leave 0 until the postal-code delivery calculator provides a value.
   */
  deliveryFeeCad?: number;
  deliveryFeeTaxable?: boolean;
  includeDelivery?: boolean;

  /**
   * Optional F&I products.
   */
  fiProducts?: FinanceLineItem[];
}

export interface FinanceQuoteResult {
  vehiclePriceCad: number;
  downPaymentCad: number;
  annualRatePercent: number;
  termMonths: number;
  taxRatePercent: number;

  dealerFees: FinanceLineItem[];
  deliveryLineItem: FinanceLineItem | null;
  fiProducts: FinanceLineItem[];

  dealerFeesCad: number;
  deliveryFeeCad: number;
  fiProductsCad: number;

  subtotalBeforeTaxCad: number;
  taxableSubtotalCad: number;
  taxCad: number;
  outTheDoorTotalCad: number;

  tradeInValueCad: number;
  tradeInPayoffCad: number;
  tradeInTaxCreditCad: number;
  tradeEquityCad: number;
  negativeEquityCad: number;
  netTradeAdjustmentCad: number;

  customerCreditsCad: number;
  amountFinancedCad: number;

  monthlyPaymentCad: number;
  biweeklyPaymentCad: number;
  totalOfPaymentsCad: number;
  totalInterestCad: number;
}

export const DEFAULT_ONTARIO_TAX_RATE_PERCENT = 13;

export function buildDefaultDealerFees(
  overrides: DealerFeeOverrides = {}
): FinanceLineItem[] {
  return [
    {
      code: 'docs',
      label: 'Docs Fee',
      amountCad: overrides.docsFeeCad ?? 895,
      taxable: overrides.docsTaxable ?? true,
      enabled: overrides.docsEnabled ?? true,
      category: 'dealer_fee',
    },
    {
      code: 'certification',
      label: 'Certification',
      amountCad: overrides.certificationFeeCad ?? 595,
      taxable: overrides.certificationTaxable ?? true,
      enabled: overrides.certificationEnabled ?? true,
      category: 'dealer_fee',
    },
    {
      code: 'licence',
      label: 'Licence Fee',
      amountCad: overrides.licenceFeeCad ?? 59,
      taxable: overrides.licenceTaxable ?? false,
      enabled: overrides.licenceEnabled ?? true,
      category: 'dealer_fee',
    },
    {
      code: 'omvic',
      label: 'OMVIC Fee',
      amountCad: overrides.omvicFeeCad ?? 22,
      taxable: overrides.omvicTaxable ?? true,
      enabled: overrides.omvicEnabled ?? true,
      category: 'dealer_fee',
    },
  ];
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function sanitizeMoney(value: number | undefined): number {
  return roundMoney(Math.max(0, value ?? 0));
}

function sanitizeInteger(value: number | undefined, min = 1): number {
  return Math.max(min, Math.floor(value ?? min));
}

function normalizeLineItems(
  items: FinanceLineItem[] | undefined,
  category: FinanceLineItem['category']
): FinanceLineItem[] {
  return (items ?? []).map((item, index) => ({
    code: item.code || `${category}-${index + 1}`,
    label: item.label || `${category}-${index + 1}`,
    amountCad: sanitizeMoney(item.amountCad),
    taxable: Boolean(item.taxable),
    enabled: item.enabled ?? true,
    category,
  }));
}

function sumEnabled(items: FinanceLineItem[]): number {
  return roundMoney(
    items.reduce((sum, item) => {
      if (item.enabled === false) return sum;
      return sum + item.amountCad;
    }, 0)
  );
}

function sumEnabledTaxable(items: FinanceLineItem[]): number {
  return roundMoney(
    items.reduce((sum, item) => {
      if (item.enabled === false || !item.taxable) return sum;
      return sum + item.amountCad;
    }, 0)
  );
}

function buildDeliveryLineItem(input: FinanceQuoteInput): FinanceLineItem | null {
  const amountCad = sanitizeMoney(input.deliveryFeeCad);
  const enabled = input.includeDelivery ?? amountCad > 0;

  if (!enabled && amountCad === 0) {
    return null;
  }

  return {
    code: 'delivery',
    label: 'Delivery / Transportation',
    amountCad,
    taxable: input.deliveryFeeTaxable ?? false,
    enabled,
    category: 'delivery',
  };
}

function calculateMonthlyPaymentFromPrincipal(
  principalCad: number,
  annualRatePercent: number,
  termMonths: number
): number {
  if (principalCad <= 0) {
    return 0;
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    return roundMoney(principalCad / termMonths);
  }

  const payment =
    principalCad *
    (monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths)));

  return roundMoney(payment);
}

export function buildFinanceQuote(input: FinanceQuoteInput): FinanceQuoteResult {
  const vehiclePriceCad = sanitizeMoney(input.vehiclePriceCad);
  const downPaymentCad = sanitizeMoney(input.downPaymentCad);
  const annualRatePercent = sanitizeMoney(input.annualRatePercent);
  const termMonths = sanitizeInteger(input.termMonths, 1);
  const taxRatePercent = sanitizeMoney(
    input.taxRatePercent ?? DEFAULT_ONTARIO_TAX_RATE_PERCENT
  );

  const dealerFees = normalizeLineItems(
    input.dealerFees ?? buildDefaultDealerFees(),
    'dealer_fee'
  );

  const deliveryLineItem = buildDeliveryLineItem(input);
  const fiProducts = normalizeLineItems(input.fiProducts, 'fi_product');

  const enabledDeliveryFeeCad =
    deliveryLineItem && deliveryLineItem.enabled !== false
      ? deliveryLineItem.amountCad
      : 0;

  const dealerFeesCad = sumEnabled(dealerFees);
  const deliveryFeeCad = roundMoney(enabledDeliveryFeeCad);
  const fiProductsCad = sumEnabled(fiProducts);

  const subtotalBeforeTaxCad = roundMoney(
    vehiclePriceCad + dealerFeesCad + deliveryFeeCad + fiProductsCad
  );

  const tradeInValueCad = sanitizeMoney(input.tradeInValueCad);
  const tradeInPayoffCad = sanitizeMoney(input.tradeInPayoffCad);
  const tradeInTaxCreditCad = roundMoney(
    Math.min(
      sanitizeMoney(input.tradeInTaxCreditCad),
      vehiclePriceCad
    )
  );

  const tradeEquityCad = roundMoney(
    Math.max(0, tradeInValueCad - tradeInPayoffCad)
  );

  const negativeEquityCad = roundMoney(
    Math.max(0, tradeInPayoffCad - tradeInValueCad)
  );

  const netTradeAdjustmentCad = roundMoney(
    negativeEquityCad - tradeEquityCad
  );

  const taxableFeesCad = roundMoney(
    sumEnabledTaxable(dealerFees) +
      (deliveryLineItem &&
      deliveryLineItem.enabled !== false &&
      deliveryLineItem.taxable
        ? deliveryLineItem.amountCad
        : 0) +
      sumEnabledTaxable(fiProducts)
  );

  const taxableSubtotalCad = roundMoney(
    Math.max(0, vehiclePriceCad + taxableFeesCad - tradeInTaxCreditCad)
  );

  const taxCad = roundMoney(taxableSubtotalCad * (taxRatePercent / 100));

  const outTheDoorTotalCad = roundMoney(subtotalBeforeTaxCad + taxCad);

  const customerCreditsCad = roundMoney(downPaymentCad + tradeEquityCad);

  const amountFinancedCad = roundMoney(
    Math.max(0, outTheDoorTotalCad + negativeEquityCad - customerCreditsCad)
  );

  const monthlyPaymentCad = calculateMonthlyPaymentFromPrincipal(
    amountFinancedCad,
    annualRatePercent,
    termMonths
  );

  const biweeklyPaymentCad = roundMoney((monthlyPaymentCad * 12) / 26);
  const totalOfPaymentsCad = roundMoney(monthlyPaymentCad * termMonths);
  const totalInterestCad = roundMoney(
    Math.max(0, totalOfPaymentsCad - amountFinancedCad)
  );

  return {
    vehiclePriceCad,
    downPaymentCad,
    annualRatePercent,
    termMonths,
    taxRatePercent,

    dealerFees,
    deliveryLineItem,
    fiProducts,

    dealerFeesCad,
    deliveryFeeCad,
    fiProductsCad,

    subtotalBeforeTaxCad,
    taxableSubtotalCad,
    taxCad,
    outTheDoorTotalCad,

    tradeInValueCad,
    tradeInPayoffCad,
    tradeInTaxCreditCad,
    tradeEquityCad,
    negativeEquityCad,
    netTradeAdjustmentCad,

    customerCreditsCad,
    amountFinancedCad,

    monthlyPaymentCad,
    biweeklyPaymentCad,
    totalOfPaymentsCad,
    totalInterestCad,
  };
}

export function calculateMonthlyPayment(input: FinanceQuoteInput): number {
  return buildFinanceQuote(input).monthlyPaymentCad;
}

export function calculateBiweeklyPayment(input: FinanceQuoteInput): number {
  return buildFinanceQuote(input).biweeklyPaymentCad;
}

export function calculateAmountFinanced(input: FinanceQuoteInput): number {
  return buildFinanceQuote(input).amountFinancedCad;
}
