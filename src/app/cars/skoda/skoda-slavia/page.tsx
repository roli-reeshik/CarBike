import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";
import { SlaviaDetailView } from "@/components/vehicle-details/slavia-detail-view";
import { formatInr } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const vehicle = await getVehicleBySlug("skoda-slavia");

  if (!vehicle) {
    return {
      title: "Škoda Slavia Not Found — CarBikeKharido",
    };
  }

  const priceText = `${formatInr(vehicle.priceMin)} – ${formatInr(vehicle.priceMax)}`;

  return {
    title: `Škoda Slavia Price (Delhi), 1.5L TSI EVO & 1.0L Specs, 5-Trim Feature Matrix — CarBikeKharido`,
    description: `Explore the Škoda Slavia with ex-showroom prices from ${priceText}, technical specifications (150 PS TSI EVO & 115 PS TSI), 5-trim feature matrix (Classic to Monte Carlo), 5-Star Global NCAP safety, and variant comparison.`,
    openGraph: {
      title: `Škoda Slavia — Full Details, 1.5L TSI EVO Specs & Variant Comparison`,
      description: `Official technical specifications, feature matrix across 5 trims, and Delhi ex-showroom pricing for Škoda Slavia.`,
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

export default async function SkodaSlaviaDetailPage() {
  const vehicle = await getVehicleBySlug("skoda-slavia");

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
      <SlaviaDetailView vehicle={vehicle} />
    </main>
  );
}
