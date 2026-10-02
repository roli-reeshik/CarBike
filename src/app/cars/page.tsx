import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { VehicleFilter } from "@/components/VehicleFilter";

export const metadata: Metadata = {
  title: "New Cars in India 2026 — Prices, Specs, Compare & Verified Dealers",
  description:
    "Explore latest new cars launched in India. Search and filter by brand, sedan/SUV body types, petrol, hybrid, EV fuels, and budget ranges.",
};

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    bodyType?: string;
    fuel?: string;
    budget?: string;
    q?: string;
  }>;
}

export default async function CarsPage({ searchParams }: PageProps) {
  const vehicles = await getCatalog();
  const params = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-6 pb-20 sm:px-6">
      <header className="mb-8 border-b border-line pb-8">
        <p className="text-xs font-bold tracking-[0.22em] text-accent uppercase">
          Car Catalogue
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
          New Cars & SUVs
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Browse verified models across Honda Cars, Tata, Hyundai, and more. Filter
          by body style, fuel economy, and ex-showroom price brackets.
        </p>
      </header>

      <VehicleFilter
        vehicles={vehicles}
        initialCategory="CAR"
        initialBrand={params.brand || ""}
        initialBodyType={params.bodyType || "any"}
      />
    </main>
  );
}
