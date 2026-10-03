import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";
import { VehicleDetailView } from "@/components/vehicle-details/vehicle-detail-view";
import { formatInr } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const vehicle = await getVehicleBySlug("honda-city");

  if (!vehicle) {
    return {
      title: "Honda City Not Found — CarBikeKharido",
    };
  }

  const priceText = `${formatInr(vehicle.priceMin)} – ${formatInr(vehicle.priceMax)}`;

  return {
    title: `Honda City Price (Delhi), e:HEV Hybrid & i-VTEC Specs, Feature Matrix — CarBikeKharido`,
    description: `Explore the Honda City with ex-showroom prices from ${priceText}, technical specifications (e:HEV Strong Hybrid & i-VTEC Petrol), Honda SENSING Level 2 ADAS suite, and variant comparison.`,
    openGraph: {
      title: `Honda City — Full Specifications & Variants`,
      description: `Official technical specifications, feature matrix across all trims, Delhi ex-showroom pricing for Honda City.`,
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

export default async function HondaCityDetailPage() {
  const vehicle = await getVehicleBySlug("honda-city");

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
      <VehicleDetailView vehicle={vehicle} />
    </main>
  );
}
