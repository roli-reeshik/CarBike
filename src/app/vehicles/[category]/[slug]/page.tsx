import { redirect, notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function VehicleCategorySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  const brandSlug = vehicle.brandSlug || "honda-cars";
  redirect(`/cars/${brandSlug}/${vehicle.slug}`);
}
