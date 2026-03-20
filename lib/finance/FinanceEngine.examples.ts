import { buildFinanceQuote, buildDefaultDealerFees } from './FinanceEngine';

const defaultDealerFees = buildDefaultDealerFees();

export const financeEngineExamples = {
  cashDeal: buildFinanceQuote({
    vehiclePriceCad: 29995,
    downPaymentCad: 29995,
    annualRatePercent: 0,
    termMonths: 1,
    taxRatePercent: 13,
    dealerFees: defaultDealerFees,
    deliveryFeeCad: 0,
    fiProducts: [],
  }),

  financeWithDownPayment: buildFinanceQuote({
    vehiclePriceCad: 34995,
    downPaymentCad: 5000,
    annualRatePercent: 8.99,
    termMonths: 72,
    taxRatePercent: 13,
    dealerFees: defaultDealerFees,
    deliveryFeeCad: 0,
    fiProducts: [],
  }),

  tradeInPositiveEquity: buildFinanceQuote({
    vehiclePriceCad: 36995,
    downPaymentCad: 3000,
    annualRatePercent: 8.49,
    termMonths: 72,
    taxRatePercent: 13,
    dealerFees: defaultDealerFees,
    tradeInValueCad: 12000,
    tradeInPayoffCad: 7000,
    tradeInTaxCreditCad: 12000,
    deliveryFeeCad: 0,
    fiProducts: [],
  }),

  tradeInNegativeEquity: buildFinanceQuote({
    vehiclePriceCad: 36995,
    downPaymentCad: 3000,
    annualRatePercent: 8.49,
    termMonths: 72,
    taxRatePercent: 13,
    dealerFees: defaultDealerFees,
    tradeInValueCad: 8000,
    tradeInPayoffCad: 12000,
    tradeInTaxCreditCad: 8000,
    deliveryFeeCad: 0,
    fiProducts: [],
  }),

  deliveryFeeAdded: buildFinanceQuote({
    vehiclePriceCad: 32995,
    downPaymentCad: 4000,
    annualRatePercent: 7.99,
    termMonths: 60,
    taxRatePercent: 13,
    dealerFees: defaultDealerFees,
    deliveryFeeCad: 850,
    deliveryFeeTaxable: false,
    includeDelivery: true,
    fiProducts: [],
  }),

  fiProductAdded: buildFinanceQuote({
    vehiclePriceCad: 33995,
    downPaymentCad: 4500,
    annualRatePercent: 8.99,
    termMonths: 72,
    taxRatePercent: 13,
    dealerFees: defaultDealerFees,
    deliveryFeeCad: 0,
    fiProducts: [
      {
        code: 'extended-warranty',
        label: 'Extended Warranty',
        amountCad: 2495,
        taxable: true,
        enabled: true,
        category: 'fi_product',
      },
    ],
  }),
};
