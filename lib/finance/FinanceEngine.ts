export interface FinanceQuoteInput {
  priceCad: number;
  downPaymentCad: number;
  annualRatePercent: number;
  termMonths: number;
}

export function calculateMonthlyPayment(input: FinanceQuoteInput): number {
  const principal = Math.max(0, input.priceCad - input.downPaymentCad);
  const monthlyRate = input.annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return Number((principal / input.termMonths).toFixed(2));
  const payment = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -input.termMonths)));
  return Number(payment.toFixed(2));
}
