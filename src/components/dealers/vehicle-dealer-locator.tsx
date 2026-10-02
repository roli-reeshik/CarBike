"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import type { CatalogDealer, OutletTypeName } from "@/lib/requirements";
import { cn, telHref } from "@/lib/utils";

interface VehicleDealerLocatorProps {
  dealers: CatalogDealer[];
  brandName: string;
  brandSlug?: string;
  vehicleName: string;
}

export function VehicleDealerLocator({
  dealers,
  brandName,
  brandSlug = "all",
  vehicleName,
}: VehicleDealerLocatorProps) {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedOutletType, setSelectedOutletType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract cities where this brand/vehicle has dealers
  const cities = useMemo(() => {
    const set = new Set<string>();
    dealers.forEach((d) => {
      if (d.city) set.add(d.city);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [dealers]);

  // Filtered dealers
  const filteredDealers = useMemo(() => {
    return dealers.filter((d) => {
      // 1. City filter
      if (
        selectedCity !== "all" &&
        d.city.toLowerCase() !== selectedCity.toLowerCase()
      ) {
        return false;
      }

      // 2. Outlet Type filter
      if (selectedOutletType !== "all" && d.outletType !== selectedOutletType) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = `${d.name} ${d.address} ${d.city} ${d.state || ""} ${d.pincode || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [dealers, selectedCity, selectedOutletType, searchQuery]);

  const hasActiveFilters =
    selectedCity !== "all" ||
    selectedOutletType !== "all" ||
    Boolean(searchQuery.trim());

  function handleReset() {
    setSelectedCity("all");
    setSelectedOutletType("all");
    setSearchQuery("");
  }

  const getOutletBadge = (type?: OutletTypeName) => {
    switch (type) {
      case "THREE_S_FACILITY":
        return {
          label: "3S Facility (Sales, Service, Spares)",
          color: "bg-good-soft text-good border-good/20",
          icon: ShieldCheck,
        };
      case "SERVICE":
        return {
          label: "Authorized Service",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Wrench,
        };
      case "SHOWROOM":
      default:
        return {
          label: "Authorized Showroom",
          color: "bg-accent-soft text-accent border-accent/20",
          icon: Building2,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Control Panel */}
      <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-good/20 bg-good-soft px-3 py-1 text-xs font-semibold text-good">
              <ShieldCheck className="size-3.5" />
              Verified {brandName} Touchpoints
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink">
              Authorized {vehicleName} Dealerships
            </h3>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Discover genuine {brandName} showrooms, schedule a test drive for the {vehicleName}, or connect with factory-certified service centers.
            </p>
          </div>

          <Link
            href={
              brandSlug && brandSlug !== "all"
                ? `/dealers?brand=${encodeURIComponent(brandSlug)}`
                : "/dealers"
            }
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink hover:bg-card hover:border-accent transition-all shrink-0 self-start sm:self-auto"
          >
            <span>View All Brand Outlets</span>
            <ExternalLink className="size-3.5 text-muted" />
          </Link>
        </div>

        {/* Filter Controls: City, Outlet, Search */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-center pt-4 border-t border-line/60">
          {/* Live Search */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 size-4 text-muted" />
            <input
              type="text"
              placeholder={`Search ${brandName} dealers by name, locality, or pin...`}
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
              <option value="all">All Available Cities ({cities.length})</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Outlet Type Switcher */}
          <div className="lg:col-span-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { key: "all", label: "All Outlets" },
                { key: "SHOWROOM", label: "Showrooms" },
                { key: "THREE_S_FACILITY", label: "3S Facilities" },
                { key: "SERVICE", label: "Service" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedOutletType(t.key)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
                  selectedOutletType === t.key
                    ? "bg-ink text-card shadow-xs"
                    : "border border-line bg-paper text-muted hover:text-ink hover:bg-card"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line/40">
          <p>
            Showing <strong className="text-ink">{filteredDealers.length}</strong> of{" "}
            <strong className="text-ink">{dealers.length}</strong> authorized locations
            {selectedCity !== "all" && ` in ${selectedCity}`}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-accent font-semibold hover:underline"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Dealer Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDealers.map((d) => {
          const badge = getOutletBadge(d.outletType);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={d.id}
              className="flex flex-col justify-between rounded-3xl border border-line bg-card p-5 shadow-xs hover:border-accent/40 hover:shadow-sm transition-all group"
            >
              <div className="space-y-3">
                {/* Top Row: Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      badge.color
                    )}
                  >
                    <BadgeIcon className="size-3" />
                    {badge.label}
                  </span>

                  {d.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-good">
                      <CheckCircle2 className="size-3.5 fill-good/10" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Dealer Name & Code */}
                <div>
                  <h4 className="font-display text-base font-bold text-ink group-hover:text-accent transition-colors">
                    {d.name}
                  </h4>
                  {d.dealerCode && (
                    <p className="text-[10px] font-mono text-muted uppercase tracking-wider">
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
                  <span className="text-muted text-[11px]">
                    ({d.reviewCount} verified reviews)
                  </span>
                </div>

                {/* Physical Address */}
                <div className="flex items-start gap-2 text-xs text-muted">
                  <MapPin className="size-4 shrink-0 text-accent mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-medium text-ink line-clamp-2">{d.address}</p>
                    <p className="text-[11px] text-muted">
                      {d.city}, {d.state} - {d.pincode}
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                {d.operatingHours && (
                  <div className="flex items-center gap-2 text-[11px] text-muted rounded-xl bg-paper/60 px-3 py-1.5 border border-line/50">
                    <Clock className="size-3.5 shrink-0 text-muted" />
                    <span className="line-clamp-1">{d.operatingHours}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Phone, Maps, Test Drive */}
              <div className="mt-5 space-y-2 pt-4 border-t border-line/60">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={telHref(d.phone)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
                  >
                    <Phone className="size-3.5" />
                    Call Dealer
                  </a>

                  {d.googleMapsUrl ? (
                    <a
                      href={d.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-colors"
                    >
                      <Navigation className="size-3.5" />
                      Directions
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 rounded-xl border border-line/40 bg-paper/40 py-2 text-xs text-muted cursor-not-allowed">
                      <Navigation className="size-3.5" />
                      Maps
                    </span>
                  )}
                </div>

                {/* Book Test Drive / Inquiry Button */}
                <a
                  href={`#inquire-dealer-${d.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    // Scroll to lead capture or top test drive trigger
                    const leadEl = document.getElementById("lead-capture-section");
                    if (leadEl) {
                      leadEl.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = `tel:${d.phone.replace(/[^\d+]/g, "")}`;
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2 text-xs font-semibold text-card hover:bg-accent transition-colors"
                >
                  <CalendarCheck className="size-3.5" />
                  Book {vehicleName} Test Drive
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDealers.length === 0 && (
        <div className="rounded-3xl border border-line bg-card p-12 text-center space-y-3">
          <Building2 className="mx-auto size-10 text-muted opacity-50" />
          <h4 className="font-display text-lg font-bold text-ink">
            No authorized dealerships match your criteria
          </h4>
          <p className="text-xs text-muted max-w-md mx-auto">
            Try resetting your city or search filters to view touchpoints across other regions.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-card hover:bg-accent transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
