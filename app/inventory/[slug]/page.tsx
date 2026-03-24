import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getVehicleBySlug } from '@/lib/data/vehicles';
import { buildCanonicalVdpPath } from '@/lib/seo/routes';

interface ShortVdpPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function ShortVdpPage({ params }: ShortVdpPageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    permanentRedirect('/inventory');
  }

  permanentRedirect(buildCanonicalVdpPath(vehicle.make, vehicle.model, vehicle.slug));
}
