import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ChevronRight, ShieldCheck } from "lucide-react";
import { getDealerNetworkBrands, getDealers } from "@/lib/catalog";
import { DealerDirectory } from "@/components/dealers/dealer-directory";

export const metadata: Metadata = {
  title: "Authorized Car Dealerships & Showrooms | Honda, Hyundai, Škoda | CarBikeKharido",
  description:
    "Find official authorized car dealers, showrooms, and service centers for Honda Cars India, Hyundai India, and Škoda Auto India. Verified addresses, direct phone numbers, and navigation directions.",
};

interface DealersPageProps {
  searchParams: Promise<{
    brand?: string;
    city?: string;
  }>;
}

export default async function DealersPage({ searchParams }: DealersPageProps) {
  const { brand, city } = await searchParams;

  const [dealers, brands] = await Promise.all([
    getDealers(),
    getDealerNetworkBrands(),
  ]);

  return (
    <main className="min-h-screen bg-paper pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-ink">Dealer Network</span>
        </nav>

        {/* Page Hero Header */}
        <header className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <ShieldCheck className="size-3.5" />
              100% Verified OEM Authorized Touchpoints
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Authorized Car Dealerships &amp; Showrooms
            </h1>
            <p className="text-sm text-muted sm:text-base leading-relaxed">
              Explore official authorized showrooms, state-of-the-art service centres, and comprehensive 3S facilities for{" "}
              <strong className="text-ink font-semibold">Honda Cars India</strong>,{" "}
              <strong className="text-ink font-semibold">Hyundai India</strong>, and{" "}
              <strong className="text-ink font-semibold">Škoda Auto India</strong>. Direct contacts, genuine coordinates, and priority test drive bookings.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line/70 pt-6 sm:grid-cols-4">
            <div className="rounded-2xl border border-line bg-paper/60 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Touchpoints</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{dealers.length}+</p>
            </div>
            <div className="rounded-2xl border border-line bg-paper/60 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">OEM Brands</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">{brands.length} Brands</p>
            </div>
            <div className="rounded-2xl border border-line bg-paper/60 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Metro Hubs Covered</p>
              <p className="mt-1 font-display text-2xl font-bold text-good">6 Major Metros</p>
            </div>
            <div className="rounded-2xl border border-line bg-paper/60 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Facility Types</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">Showroom &amp; 3S</p>
            </div>
          </div>
        </header>

        {/* Global Directory Component */}
        <DealerDirectory
          initialDealers={dealers}
          brands={brands}
          defaultBrandSlug={brand || "all"}
          defaultCity={city || "all"}
        />

        {/* Informative Footer Card: OEM Network Guidelines */}
        <section className="rounded-3xl border border-line bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-accent" />
            <h2 className="font-display text-lg font-bold text-ink">
              Why Buy Through OEM Authorized Dealerships?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-xs text-muted leading-relaxed">
            <div className="rounded-2xl border border-line/60 bg-paper/40 p-4 space-y-1.5">
              <p className="font-bold text-ink text-sm">Genuine Factory Warranty</p>
              <p>
                Receive standard 3-year to 4-year factory warranty coverage with optional extended warranty and roadside assistance (RSA) valid nationwide.
              </p>
            </div>
            <div className="rounded-2xl border border-line/60 bg-paper/40 p-4 space-y-1.5">
              <p className="font-bold text-ink text-sm">Certified Techs &amp; Spares</p>
              <p>
                All 3S facilities and workshops utilize factory-trained master technicians, specialized diagnostic tools, and 100% genuine OEM spare parts.
              </p>
            </div>
            <div className="rounded-2xl border border-line/60 bg-paper/40 p-4 space-y-1.5">
              <p className="font-bold text-ink text-sm">Transparent Price &amp; Offers</p>
              <p>
                Get authentic ex-showroom pricing, official consumer schemes, manufacturer exchange bonuses, and transparent corporate discounts.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
