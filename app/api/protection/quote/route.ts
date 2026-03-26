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
  products: z.array(z.string()).optional(),
});

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

  // Stub response — returns 202 Accepted with clear stub labeling
  return NextResponse.json(
    {
      status: 'stub',
      message: 'Protection quote integration is reserved for a future phase.',
      vehicleId: parsed.data.vehicleId,
      quotes: [],
    },
    { status: 202 },
  );
}
