import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";
import { VernaDetailView } from "@/components/vehicle-details/verna-detail-view";
import { formatInr } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const vehicle = await getVehicleBySlug("hyundai-verna");

  if (!vehicle) {
    return {
      title: "Hyundai Verna Not Found — CarBikeKharido",
    };
  }

  const priceText = `${formatInr(vehicle.priceMin)} – ${formatInr(vehicle.priceMax)}`;

  return {
    title: `Hyundai Verna Price (Delhi), 1.5L Turbo & MPi Specs, 6-Trim Feature Matrix — CarBikeKharido`,
    description: `Explore the Hyundai Verna with ex-showroom prices from ${priceText}, technical specifications (160 PS Turbo GDi & 115 PS MPi), 6-trim feature matrix (HX 2 to HX 10), Level 2 ADAS suite, and variant comparison.`,
    openGraph: {
      title: `Hyundai Verna — Full Details, Turbo Specs & Variant Comparison`,
      description: `Official technical specifications, feature matrix across 6 trims, and Delhi ex-showroom pricing for Hyundai Verna.`,
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

export default async function HyundaiVernaDetailPage() {
  const vehicle = await getVehicleBySlug("hyundai-verna");

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
      <VernaDetailView vehicle={vehicle} />
    </main>
  );
}
