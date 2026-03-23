import { NextRequest, NextResponse } from 'next/server';
import { getVehicleVdp } from '@/lib/vehicles/getVehicleVdp';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing required query parameter: slug' },
      { status: 400 },
    );
  }

  const data = await getVehicleVdp(slug);

  if (!data) {
    return NextResponse.json(
      { error: `Vehicle not found for slug: ${slug}` },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}
