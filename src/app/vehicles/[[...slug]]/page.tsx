import { redirect, notFound } from 'next/navigation';
import { getVehicleBySlug } from '@/lib/catalog';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function VehicleCatchAllPage({ params }: PageProps) {
  const { slug: segments } = await params;
  if (!segments || segments.length === 0) {
    notFound();
  }

  // The vehicle model slug is the last segment in the path
  const vehicleSlug = segments[segments.length - 1];
  const vehicle = await getVehicleBySlug(vehicleSlug);

  if (!vehicle) {
    notFound();
  }

  const brandSlug = vehicle.brandSlug || 'honda-cars';
  redirect(`/cars/${brandSlug}/${vehicle.slug}`);
}
