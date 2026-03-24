import { notFound, permanentRedirect } from 'next/navigation';
import { getVehicleBySlug } from '@/lib/data/vehicleQueries';
import { buildVehicleCanonicalPath } from '@/lib/site/routes';

type VehicleHelperRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VehicleHelperRoutePage({
  params,
}: VehicleHelperRouteProps) {
  const resolvedParams = await params;
  const vehicle = getVehicleBySlug(resolvedParams.slug);

  if (!vehicle) {
    notFound();
  }

  permanentRedirect(buildVehicleCanonicalPath(vehicle));
}
