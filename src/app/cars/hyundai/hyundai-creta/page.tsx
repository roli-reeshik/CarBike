import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/catalog";
import { CretaDetailView } from "@/components/vehicle-details/creta-detail-view";
import { formatInr } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const vehicle = await getVehicleBySlug("hyundai-creta");

  if (!vehicle) {
    return {
      title: "Hyundai Creta Not Found — CarBikeKharido",
    };
  }

  const priceText = `${formatInr(vehicle.priceMin)} – ${formatInr(vehicle.priceMax)}`;

  return {
    title: `Hyundai Creta Price (Delhi), 1.5L Turbo & CRDi Specs, Feature Matrix & Brochure — CarBikeKharido`,
    description: `Explore the Hyundai Creta with ex-showroom prices from ${priceText}, technical specifications (160 PS Turbo GDi, 116 PS Diesel & 115 PS MPi), 10-trim feature matrix, Level 2 ADAS suite, color palette, and brochure download.`,
    openGraph: {
      title: `Hyundai Creta — Full Specifications, Trims & Brochure`,
      description: `Official technical specifications, feature matrix across all trims, Delhi ex-showroom pricing, and brochure for Hyundai Creta.`,
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

export default async function HyundaiCretaDetailPage() {
  const vehicle = await getVehicleBySlug("hyundai-creta");

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
      <CretaDetailView vehicle={vehicle} />
    </main>
  );
}
