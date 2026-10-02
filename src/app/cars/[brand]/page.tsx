import { redirect, notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";

interface PageProps {
  params: Promise<{ brand: string }>;
}

export default async function CarBrandOrSlugPage({ params }: PageProps) {
  const { brand } = await params;
  
  // 1. Check if the slug is a vehicle slug (e.g. "honda-city")
  const vehicle = await getVehicleBySlug(brand);
  if (vehicle) {
    const brandSlug = vehicle.brandSlug || "honda-cars";
    redirect(`/cars/${brandSlug}/${vehicle.slug}`);
  }

  // 2. If it's a known brand slug, redirect to /cars with brand filter
  if (brand === "honda-cars" || brand === "honda") {
    redirect(`/cars?brand=Honda+Cars`);
  }
  if (brand === "hyundai" || brand === "hyundai-india") {
    redirect(`/cars?brand=Hyundai+India`);
  }

  // Otherwise 404
  notFound();
}
