import type { Metadata } from "next";
import Link from "next/link";
import { getVehicleBySlug } from "@/lib/catalog";
import { CompareBoard } from "@/components/compare-board";
import { HeadToHeadCompare } from "@/components/compare/head-to-head-compare";
import { ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ car1?: string; car2?: string; car3?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { car1, car2, car3 } = await searchParams;

  if (car1 && car2 && car3) {
    const v1 = await getVehicleBySlug(car1);
    const v2 = await getVehicleBySlug(car2);
    const v3 = await getVehicleBySlug(car3);
    if (v1 && v2 && v3) {
      return {
        title: `${v1.name} vs ${v2.name} vs ${v3.name} Shootout — Specs, Mileage, Safety & Prices`,
        description: `Direct 3-way comparison between ${v1.name}, ${v2.name}, and ${v3.name}: turbo powertrains, hybrid mileage, boot capacity, NCAP crash safety, and Delhi ex-showroom prices.`,
      };
    }
  }

  if (car1 && car2) {
    const v1 = await getVehicleBySlug(car1);
    const v2 = await getVehicleBySlug(car2);
    if (v1 && v2) {
      return {
        title: `${v1.name} vs ${v2.name} Comparison — Specs, Mileage, Safety & Prices`,
        description: `Direct side-by-side comparison between ${v1.name} and ${v2.name}: performance, dimensions, boot space, chassis safety, and Delhi ex-showroom pricing.`,
      };
    }
  }

  return {
    title: "Vehicle Comparison Tool — CarBikeKharido",
    description: "Compare technical specifications, dimensions, features, and prices of your favorite cars and bikes.",
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { car1, car2, car3 } = await searchParams;

  const vehicle1 = car1 ? await getVehicleBySlug(car1) : null;
  const vehicle2 = car2 ? await getVehicleBySlug(car2) : null;
  const vehicle3 = car3 ? await getVehicleBySlug(car3) : null;

  if (vehicle1 && vehicle2) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <HeadToHeadCompare
          vehicle1={vehicle1}
          vehicle2={vehicle2}
          vehicle3={vehicle3 ?? undefined}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Popular Midsize Sedan Shootout Banners */}
      <div className="mb-10 space-y-4">
        {/* 3-Way Big 3 Shootout */}
        <div className="rounded-3xl border border-accent/40 bg-gradient-to-r from-accent-soft/20 via-paper to-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-card uppercase tracking-wider">
              <Sparkles className="size-3.5" /> Segment Benchmark Shootout (3-Way)
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-ink">
              Škoda Slavia vs. Honda City vs. Hyundai Verna
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              The definitive Indian C-Segment sedan showdown. Benchmarking Slavia’s 150 PS TSI EVO dynamics & 179 mm clearance against City’s 27.26 km/l e:HEV hybrid efficiency and Verna’s 160 PS turbo speed with Level 2 ADAS.
            </p>
          </div>
          <Link
            href="/compare?car1=skoda-slavia&car2=honda-city&car3=hyundai-verna"
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-xs font-bold text-card hover:bg-ink/90 transition-transform hover:scale-[1.02] shadow-sm shrink-0"
          >
            <SlidersHorizontal className="size-4 text-accent" /> Compare All 3 Sedans
          </Link>
        </div>

        {/* 2-Way Quick Pairings */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Slavia vs City */}
          <Link
            href="/compare?car1=skoda-slavia&car2=honda-city"
            className="group rounded-2xl border border-line bg-card p-5 hover:border-ink/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Dynamics vs Efficiency
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-ink group-hover:text-accent">
                Škoda Slavia vs. Honda City
              </h3>
              <p className="mt-1 text-xs text-muted">
                150 PS TSI vs 126 PS Strong Hybrid, 179mm vs 165mm ground clearance, European chassis vs legendary Japanese comfort.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
              <span>View Head-to-Head</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Slavia vs Verna */}
          <Link
            href="/compare?car1=skoda-slavia&car2=hyundai-verna"
            className="group rounded-2xl border border-line bg-card p-5 hover:border-ink/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Turbo Performance Battle
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-ink group-hover:text-accent">
                Škoda Slavia vs. Hyundai Verna
              </h3>
              <p className="mt-1 text-xs text-muted">
                150 PS TSI EVO with ACT vs 160 PS Turbo GDi, European suspension vs Level-2 ADAS active safety.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
              <span>View Head-to-Head</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Verna vs City */}
          <Link
            href="/compare?car1=hyundai-verna&car2=honda-city"
            className="group rounded-2xl border border-line bg-card p-5 hover:border-ink/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                Tech vs Hybrid Comfort
              </span>
              <h3 className="mt-1 font-display text-lg font-bold text-ink group-hover:text-accent">
                Hyundai Verna vs. Honda City
              </h3>
              <p className="mt-1 text-xs text-muted">
                160 PS Turbo & 17 ADAS features vs 27.26 km/l Atkinson e:HEV & Honda SENSING suite.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
              <span>View Head-to-Head</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      <header className="mb-8">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Custom Vehicle Compare</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted">
          Compare up to three vehicles dynamically across performance specs, variant pricing, dimensions, and crash ratings.
        </p>
      </header>

      <CompareBoard />
    </main>
  );
}
