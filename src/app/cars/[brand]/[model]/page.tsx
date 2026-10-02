import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";
import { VehicleDetailView } from "@/components/vehicle-details/vehicle-detail-view";
import { VernaDetailView } from "@/components/vehicle-details/verna-detail-view";
import { SlaviaDetailView } from "@/components/vehicle-details/slavia-detail-view";
import { formatInr } from "@/lib/utils";

interface PageProps {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { model } = await params;
  const vehicle = await getVehicleBySlug(model);

  if (!vehicle) {
    return {
      title: "Vehicle Not Found — CarBikeKharido",
    };
  }

  const priceText = `${formatInr(vehicle.priceMin)} – ${formatInr(vehicle.priceMax)}`;

  return {
    title: `${vehicle.name} Price (Delhi), Specs, Variants & Feature Matrix — CarBikeKharido`,
    description: `Explore the ${vehicle.name} with ex-showroom prices from ${priceText}, technical specifications, comprehensive feature matrix, color palette, and trim comparator.`,
    openGraph: {
      title: `${vehicle.name} — Full Details & Variant Comparison`,
      description: `Official technical specifications, feature matrix, and Delhi ex-showroom pricing for ${vehicle.name}.`,
      images: [
        {
          url: vehicle.heroImage,
          width: 1200,
          height: 630,
          alt: vehicle.name,
        },
      ],
    },
  };
}

export default async function CarDetailBrandModelPage({ params }: PageProps) {
  const { model } = await params;
  const vehicle = await getVehicleBySlug(model);

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
      {vehicle.slug === "hyundai-verna" ? (
        <VernaDetailView vehicle={vehicle} />
      ) : vehicle.slug === "skoda-slavia" ? (
        <SlaviaDetailView vehicle={vehicle} />
      ) : (
        <VehicleDetailView vehicle={vehicle} />
      )}
    </main>
  );
}
