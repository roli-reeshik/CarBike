"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Fuel,
  Gauge,
  HelpCircle,
  RotateCcw,
  Search,
} from "lucide-react";
import type { CatalogVehicle, VehicleCategory } from "@/lib/requirements";
import {
  CAR_BUDGETS,
  BIKE_BUDGETS,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  searchVehicles,
} from "@/lib/requirements";
import { CAR_BODY_TYPES, BIKE_BODY_TYPES } from "@/constants/vehicle";
import { cn, formatInr } from "@/lib/utils";

interface VehicleFilterProps {
  vehicles: CatalogVehicle[];
  initialCategory?: VehicleCategory;
  initialBrand?: string;
  initialBodyType?: string;
}

export function VehicleFilter({
  vehicles,
  initialCategory = "CAR",
  initialBrand = "",
  initialBodyType = "any",
}: VehicleFilterProps) {
  const [category, setCategory] = useState<VehicleCategory>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedBodyType, setSelectedBodyType] = useState<string>(initialBodyType);
  const [selectedFuel, setSelectedFuel] = useState<string>("any");
  const [selectedBudget, setSelectedBudget] = useState<string>("any");
  const [selectedTransmission, setSelectedTransmission] = useState<string>("any");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique brands for the current category
  const brandList = useMemo(() => {
    const set = new Set<string>();
    vehicles
      .filter((v) => v.category === category && v.brandName)
      .forEach((v) => set.add(v.brandName));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [vehicles, category]);

  const bodyTypes = category === "CAR" ? CAR_BODY_TYPES : BIKE_BODY_TYPES;
  const budgetOptions = category === "CAR" ? CAR_BUDGETS : BIKE_BUDGETS;

  // Perform search & filter
  const matches = useMemo(() => {
    return searchVehicles(vehicles, {
      category,
      brand: selectedBrand,
      bodyType: selectedBodyType !== "any" ? selectedBodyType : null,
      fuel: selectedFuel !== "any" ? selectedFuel : null,
      budget: selectedBudget !== "any" ? selectedBudget : null,
      transmission: selectedTransmission !== "any" ? selectedTransmission : null,
      q: searchQuery.trim() || null,
    });
  }, [
    vehicles,
    category,
    selectedBrand,
    selectedBodyType,
    selectedFuel,
    selectedBudget,
    selectedTransmission,
    searchQuery,
  ]);

  function handleReset() {
    setSelectedBrand("");
    setSelectedBodyType("any");
    setSelectedFuel("any");
    setSelectedBudget("any");
    setSelectedTransmission("any");
    setSearchQuery("");
  }

  const hasActiveFilters =
    Boolean(selectedBrand) ||
    selectedBodyType !== "any" ||
    selectedFuel !== "any" ||
    selectedBudget !== "any" ||
    selectedTransmission !== "any" ||
    Boolean(searchQuery.trim());

  return (
    <div className="space-y-8">
      {/* Category Tabs & Quick Filter Controls */}
      <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Toggle */}
          <div className="inline-flex rounded-2xl border border-line bg-paper p-1.5">
            <button
              type="button"
              onClick={() => {
                setCategory("CAR");
                setSelectedBodyType("any");
                setSelectedBrand("");
              }}
              className={cn(
                "rounded-xl px-6 py-2.5 text-sm font-bold transition-colors",
                category === "CAR"
                  ? "bg-ink text-card shadow-sm"
                  : "text-muted hover:text-ink"
              )}
            >
              Cars ({vehicles.filter((v) => v.category === "CAR").length})
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory("BIKE");
                setSelectedBodyType("any");
                setSelectedBrand("");
              }}
              className={cn(
                "rounded-xl px-6 py-2.5 text-sm font-bold transition-colors",
                category === "BIKE"
                  ? "bg-ink text-card shadow-sm"
                  : "text-muted hover:text-ink"
              )}
            >
              Bikes ({vehicles.filter((v) => v.category === "BIKE").length})
            </button>
          </div>

          {/* Search Query Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by model or brand (e.g. Honda)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-paper pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-semibold text-ink outline-none focus:border-accent"
            >
              <option value="">All Brands</option>
              {brandList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Body Type
            </label>
            <select
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-semibold text-ink outline-none focus:border-accent"
            >
              <option value="any">All Body Types</option>
              {bodyTypes.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Fuel Type
            </label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-semibold text-ink outline-none focus:border-accent"
            >
              <option value="any">All Fuels</option>
              {FUEL_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Budget
            </label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-semibold text-ink outline-none focus:border-accent"
            >
              <option value="any">Any Budget</option>
              {budgetOptions.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Transmission
            </label>
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-semibold text-ink outline-none focus:border-accent"
            >
              <option value="any">Any Transmission</option>
              {TRANSMISSION_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-4 text-xs">
          <p className="text-muted">
            Found <span className="font-bold text-ink">{matches.length}</span>{" "}
            {category === "CAR" ? "cars" : "bikes"} matching criteria
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
            >
              <RotateCcw className="size-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {matches.length === 0 && (
        <div className="rounded-3xl border border-line bg-card p-12 text-center">
          <HelpCircle className="mx-auto size-10 text-muted" />
          <h3 className="mt-3 font-display text-xl text-ink">
            No matching vehicles found
          </h3>
          <p className="mt-1 text-sm text-muted">
            Try adjusting your brand, fuel, or budget filters to discover other models.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-card"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: CatalogVehicle }) {
  const brandSlug = vehicle.brandSlug || "honda-cars";
  const detailUrl = `/cars/${brandSlug}/${vehicle.slug}`;
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-card shadow-xs transition-all hover:border-ink/40 hover:shadow-md">
      <div>
        {/* Vehicle Hero Image Container */}
        <div className="relative flex h-52 w-full items-center justify-center bg-[#ece7dd] p-4 transition-colors group-hover:bg-[#e6e0d4]">
          <Link href={detailUrl} className="relative block h-full w-full">
            <Image
              src={imgError ? "/vehicles/placeholder.svg" : vehicle.heroImage}
              alt={`${vehicle.brandName} ${vehicle.name}`}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-semibold text-accent shadow-xs backdrop-blur-sm">
              {vehicle.bodyType}
            </span>
            {vehicle.ncapRating && (
              <span className="rounded-full bg-good-soft/90 px-2 py-0.5 text-[11px] font-semibold text-good shadow-xs">
                {vehicle.ncapRating}★
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {vehicle.brandName}
          </p>
          <h3 className="mt-1 font-display text-xl text-ink group-hover:text-accent">
            <Link href={detailUrl}>{vehicle.name}</Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted">
            {vehicle.tagline || `${vehicle.bodyType} · ${vehicle.fuelTypes.join(", ")}`}
          </p>

          {/* Price Range */}
          <div className="mt-3">
            <p className="font-display text-lg font-bold text-ink">
              {formatInr(vehicle.priceMin)} – {formatInr(vehicle.priceMax)}
            </p>
            <p className="text-[11px] text-muted">Ex-Showroom Delhi</p>
          </div>

          {/* Quick Metrics */}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line/60 pt-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted">
              <Fuel className="size-3.5 text-good" />
              <span className="truncate">{vehicle.mileageOrRange}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <Gauge className="size-3.5 text-accent" />
              <span className="truncate">{vehicle.powerBhp}</span>
            </div>
          </div>

          {/* Color Swatch Dots */}
          {vehicle.colors && vehicle.colors.length > 0 && (
            <div className="mt-4 flex items-center gap-1.5">
              <span className="text-[11px] text-muted">Colours:</span>
              <div className="flex items-center gap-1">
                {vehicle.colors.slice(0, 6).map((c) => (
                  <span
                    key={c.id}
                    title={c.name}
                    className="size-3 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: c.hexCode }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with Direct Link */}
      <div className="border-t border-line/60 p-4 pt-3">
        <Link
          href={detailUrl}
          className="flex w-full items-center justify-between rounded-xl border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-card"
        >
          <span>Explore Details & Compare Variants</span>
          <ChevronRight className="size-4 text-accent" />
        </Link>
      </div>
    </article>
  );
}
