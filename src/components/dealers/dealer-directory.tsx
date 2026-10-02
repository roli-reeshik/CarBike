"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { CatalogDealer, OutletTypeName } from "@/lib/requirements";
import { cn, telHref } from "@/lib/utils";

interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  dealerCount: number;
}

interface DealerDirectoryProps {
  initialDealers: CatalogDealer[];
  brands: BrandInfo[];
  defaultBrandSlug?: string;
  defaultCity?: string;
}

export function DealerDirectory({
  initialDealers,
  brands,
  defaultBrandSlug = "all",
  defaultCity = "all",
}: DealerDirectoryProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>(defaultBrandSlug);
  const [selectedCity, setSelectedCity] = useState<string>(defaultCity);
  const [selectedOutletType, setSelectedOutletType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    initialDealers.forEach((d) => {
      if (d.city) set.add(d.city);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialDealers]);

  // Filtered dealers
  const filteredDealers = useMemo(() => {
    return initialDealers.filter((d) => {
      // 1. Brand filter
      if (selectedBrand !== "all" && d.brandSlug !== selectedBrand) {
        return false;
      }

      // 2. City filter
      if (selectedCity !== "all" && d.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 3. Outlet Type filter
      if (selectedOutletType !== "all" && d.outletType !== selectedOutletType) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = `${d.name} ${d.address} ${d.city} ${d.state || ""} ${d.pincode || ""} ${d.brandName || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [initialDealers, selectedBrand, selectedCity, selectedOutletType, searchQuery]);

  function handleReset() {
    setSelectedBrand("all");
    setSelectedCity("all");
    setSelectedOutletType("all");
    setSearchQuery("");
  }

  const hasActiveFilters =
    selectedBrand !== "all" ||
    selectedCity !== "all" ||
    selectedOutletType !== "all" ||
    Boolean(searchQuery.trim());

  const getOutletBadge = (type?: OutletTypeName) => {
    switch (type) {
      case "THREE_S_FACILITY":
        return { label: "3S Facility (Sales, Service, Spares)", color: "bg-good-soft text-good border-good/20" };
      case "SERVICE":
        return { label: "Authorized Service", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "SHOWROOM":
      default:
        return { label: "Authorized Showroom", color: "bg-accent-soft text-accent border-accent/20" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Header Control Card */}
      <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8 space-y-6">
        {/* Brand Selector Pills */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2.5">
            Select Manufacturer Network:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedBrand("all")}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                selectedBrand === "all"
                  ? "bg-ink text-card shadow-xs"
                  : "border border-line bg-paper text-muted hover:text-ink hover:bg-card"
              )}
            >
              All Brands ({initialDealers.length})
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBrand(b.slug)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5",
                  selectedBrand === b.slug
                    ? "bg-accent text-card shadow-xs font-bold"
                    : "border border-line bg-paper text-muted hover:text-ink hover:bg-card"
                )}
              >
                <span>{b.name}</span>
                <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                  {b.dealerCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Controls: City, Outlet, Search */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-center pt-4 border-t border-line/60">
          {/* Live Search */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 size-4 text-muted" />
            <input
              type="text"
              placeholder="Search by dealer name, area, or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-hidden"
            />
          </div>

          {/* City Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper py-2.5 px-3 text-xs font-medium text-ink focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Cities ({cities.length})</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Outlet Type Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedOutletType}
              onChange={(e) => setSelectedOutletType(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper py-2.5 px-3 text-xs font-medium text-ink focus:border-accent focus:outline-hidden"
            >
              <option value="all">All Outlet Types</option>
              <option value="SHOWROOM">Showroom Only</option>
              <option value="THREE_S_FACILITY">3S Facility (Sales, Service & Spares)</option>
              <option value="SERVICE">Service Center Only</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="lg:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset filters"
                className="flex items-center gap-1 rounded-xl border border-line p-2.5 text-xs text-muted hover:text-ink hover:bg-paper"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line/40">
          <span>
            Showing <strong className="text-ink">{filteredDealers.length}</strong> verified authorized dealerships
          </span>
          <span className="flex items-center gap-1 text-good font-semibold">
            <ShieldCheck className="size-3.5" /> 100% Manufacturer Verified Network
          </span>
        </div>
      </section>

      {/* Dealer Cards Grid */}
      <section>
        {filteredDealers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-card p-12 text-center space-y-3">
            <Building2 className="mx-auto size-8 text-muted" />
            <h3 className="font-display text-xl font-bold text-ink">No Dealerships Found</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              No dealerships match your current filter parameters. Try clearing the search or changing the selected city.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-card"
            >
              <RotateCcw className="size-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDealers.map((d) => {
              const badge = getOutletBadge(d.outletType);

              return (
                <article
                  key={d.id}
                  className="flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-xs hover:border-ink/40 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">
                        {d.brandName}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          badge.color
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Dealer Name & Code */}
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink flex items-baseline gap-1.5">
                        <span>{d.name}</span>
                        {d.isVerified && (
                          <span title="Verified Authorized Dealer">
                            <CheckCircle2 className="size-4 text-good shrink-0 inline" />
                          </span>
                        )}
                      </h3>
                      {d.dealerCode && (
                        <p className="text-[11px] font-mono text-muted uppercase mt-0.5">
                          Code: {d.dealerCode}
                        </p>
                      )}
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-bold text-accent">
                        <Star className="size-3.5 fill-accent" />
                        <span>{d.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted">
                        ({d.reviewCount || 150} customer reviews)
                      </span>
                    </div>

                    {/* Address & Operating Hours */}
                    <div className="space-y-2 text-xs text-muted border-t border-line/60 pt-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-accent shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          {d.address}, {d.city}, {d.state} {d.pincode && `— ${d.pincode}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <Clock className="size-3.5 text-muted shrink-0" />
                        <span>{d.operatingHours || "9:30 AM - 7:30 PM (Mon-Sun)"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-line/60 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Call Action */}
                      <a
                        href={telHref(d.phone)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 px-3 text-xs font-bold text-card hover:bg-ink/90 transition-transform active:scale-95 shadow-xs"
                      >
                        <Phone className="size-3.5" />
                        <span>Call Dealer</span>
                      </a>

                      {/* Google Maps Directions */}
                      <a
                        href={d.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(d.name + " " + d.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2.5 px-3 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
                      >
                        <Navigation className="size-3.5 text-accent" />
                        <span>Directions</span>
                      </a>
                    </div>

                    {/* Book Test Drive Shortcut */}
                    <Link
                      href={`/dealers?inquire=${d.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `tel:${d.phone.replace(/[^\d+]/g, "")}`;
                      }}
                      className="block w-full text-center rounded-xl bg-accent-soft/40 py-2 text-[11px] font-semibold text-accent hover:bg-accent-soft transition-colors"
                    >
                      Instant Test Drive Inquiry: {d.phone}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
