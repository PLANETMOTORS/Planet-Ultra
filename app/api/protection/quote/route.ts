import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/protection/quote
 *
 * Protection product quote endpoint.
 * Status: stub/reserved — the F&I protection product integration is a
 * future phase deliverable. This handler validates the request shape and
 * returns a well-formed stub response so the purchase shell can test the
 * full flow without a live integration.
 */

const QuoteSchema = z.object({
  vehicleId: z.string().min(1).max(255),
  vehicleYear: z.number().int().min(1900).max(2100),
  vehicleMake: z.string().min(1).max(100),
  vehicleModel: z.string().min(1).max(100),
  vehiclePriceCad: z.number().positive(),
  mileageKm: z.number().int().positive(),
  products: z.array(z.enum(['essential', 'comprehensive', 'ultimate'])).optional(),
});

const planConfig: Record<'essential' | 'comprehensive' | 'ultimate', { months: number; rate: number; deductibleCad: number; name: string }> = {
  essential: { months: 12, rate: 0.018, deductibleCad: 500, name: 'Essential' },
  comprehensive: { months: 24, rate: 0.031, deductibleCad: 300, name: 'Comprehensive' },
  ultimate: { months: 36, rate: 0.044, deductibleCad: 200, name: 'Ultimate' },
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const selectedProducts: Array<keyof typeof planConfig> =
    parsed.data.products && parsed.data.products.length > 0
      ? parsed.data.products
      : ['comprehensive'];

  const mileageFactor =
    parsed.data.mileageKm > 150000 ? 1.2 : parsed.data.mileageKm > 90000 ? 1.1 : 1;

  const quotes = selectedProducts.map((code) => {
    const config = planConfig[code];
    const totalCad = Math.round(parsed.data.vehiclePriceCad * config.rate * mileageFactor);
    const monthlyCad = Math.round(totalCad / config.months);
    return {
      code,
      name: config.name,
      monthlyCad,
      totalCad,
      deductibleCad: config.deductibleCad,
    };
  });

  // Stub response — deterministic quote preview for UI/flow testing.
  return NextResponse.json(
    {
      status: 'stub',
      message: 'Protection quote preview generated. Provider integration remains a future phase.',
      vehicleId: parsed.data.vehicleId,
      quotes,
    },
    { status: 202 },
  );
}
