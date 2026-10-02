"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Gauge,
  Layers,
  MapPin,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type {
  CatalogColor,
  CatalogVehicle,
  EngineSpecCategory,
  FeatureCategory,
} from "@/lib/requirements";
import { cn, formatInr } from "@/lib/utils";
import { VehicleDealerLocator } from "@/components/dealers/vehicle-dealer-locator";

type TabKey = "powertrain" | "features" | "progression" | "pricing" | "dealers";

const TRIM_NAMES = ["HX 2", "HX 4", "HX 6", "HX 6+", "HX 8", "HX 10"] as const;

export function VernaDetailView({ vehicle }: { vehicle: CatalogVehicle }) {
  const [activeTab, setActiveTab] = useState<TabKey>("powertrain");

  // Colors
  const colors: CatalogColor[] = vehicle.colors.length
    ? vehicle.colors
    : [
        {
          id: "white",
          name: "Atlas White",
          hexCode: "#F8FAFC",
          previewUrl: "/vehicles/cars/hyundai/hyundai-verna/Verna/Atlas White.png",
          imageUrl: "/vehicles/cars/hyundai/hyundai-verna/Verna/Atlas White.png",
        },
      ];
  const [selectedColorId, setSelectedColorId] = useState<string>(colors[0].id);
  const selectedColor =
    colors.find((c) => c.id === selectedColorId) ?? colors[0];
  const [imgError, setImgError] = useState(false);

  // Engine Specs & Features
  const engineSpecs: EngineSpecCategory[] = useMemo(
    () => vehicle.engineSpecs ?? [],
    [vehicle.engineSpecs]
  );
  const featureMatrix: FeatureCategory[] = useMemo(
    () => vehicle.featureMatrix ?? [],
    [vehicle.featureMatrix]
  );

  // Feature Matrix state
  const [activeFeatureCategory, setActiveFeatureCategory] = useState<string>(
    featureMatrix[0]?.category || "Safety"
  );
  const [featureSearch, setFeatureSearch] = useState<string>("");
  const [showDifferencesOnly, setShowDifferencesOnly] = useState<boolean>(false);

  // Transmission filter for Pricing tab
  const [pricingTransmission, setPricingTransmission] = useState<string>("ALL");

  // Filtered features
  const filteredFeatures = useMemo(() => {
    const cat = featureMatrix.find((c) => c.category === activeFeatureCategory);
    if (!cat) return [];

    return cat.features.filter((f) => {
      // 1. Text search
      if (featureSearch.trim()) {
        const query = featureSearch.toLowerCase();
        const matchesName = f.feature.toLowerCase().includes(query);
        const matchesTrims = Object.values(f.trims).some((v) =>
          v.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesTrims) return false;
      }

      // 2. Differences only filter
      if (showDifferencesOnly) {
        const vals = TRIM_NAMES.map((t) => f.trims[t] || "—");
        const allSame = vals.every((v) => v === vals[0]);
        if (allSame) return false;
      }

      return true;
    });
  }, [featureMatrix, activeFeatureCategory, featureSearch, showDifferencesOnly]);

  // Filtered variants for pricing tab
  const filteredVariants = useMemo(() => {
    if (pricingTransmission === "ALL") return vehicle.variants;
    if (pricingTransmission === "MT") {
      return vehicle.variants.filter((v) => v.transmission.toLowerCase().includes("manual") || v.name.includes("MT"));
    }
    if (pricingTransmission === "IVT") {
      return vehicle.variants.filter((v) => v.name.includes("IVT") || v.transmission.toLowerCase().includes("ivt"));
    }
    if (pricingTransmission === "DCT") {
      return vehicle.variants.filter((v) => v.name.includes("DCT") || v.transmission.toLowerCase().includes("dct"));
    }
    return vehicle.variants;
  }, [vehicle.variants, pricingTransmission]);

  const brochurePath = "/vehicles/cars/hyundai/hyundai-verna/Verna/verna.pdf";

  return (
    <div className="space-y-10">
      {/* ============================================================== */}
      {/* 1. HERO & VEHICLE SHOWCASE                                     */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-card to-paper/50 p-6 shadow-xs sm:p-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Info & Color Swatches */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent uppercase tracking-wider">
                  Hyundai India
                </span>
                <span className="flex items-center gap-1 rounded-full bg-good-soft px-2.5 py-0.5 text-xs font-semibold text-good">
                  <Shield className="size-3.5" /> 5-Star Global NCAP
                </span>
                <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink">
                  C-Segment Sedan
                </span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {vehicle.name}
              </h1>
              <p className="mt-2 text-base text-muted">
                {vehicle.tagline || "Futuristic. Ferocious. Fast."}
              </p>
            </div>

            {/* Price Banner */}
            <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Ex-Showroom Price (Delhi)
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                  {formatInr(vehicle.priceMin)} – {formatInr(vehicle.priceMax)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                22 Distinct Variants across 1.5L MPi & 1.5L Turbo GDi
              </p>
            </div>

            {/* Color Palette Switcher */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted uppercase tracking-wider">
                  Exterior Color
                </span>
                <span className="font-medium text-ink">{selectedColor.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {colors.map((c) => {
                  const isSelected = c.id === selectedColor.id;
                  const isDualTone = c.name.includes("Black Roof");
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorId(c.id);
                        setImgError(false);
                      }}
                      className={cn(
                        "relative size-9 rounded-full transition-all focus:outline-hidden",
                        isSelected
                          ? "ring-2 ring-accent ring-offset-2 scale-110 shadow-md"
                          : "opacity-80 hover:opacity-100 hover:scale-105"
                      )}
                      title={c.name}
                    >
                      {isDualTone ? (
                        <div className="relative size-full overflow-hidden rounded-full border border-black/20">
                          <span
                            className="absolute inset-0 w-1/2"
                            style={{ backgroundColor: c.hexCode }}
                          />
                          <span
                            className="absolute inset-y-0 right-0 w-1/2 bg-slate-900"
                          />
                        </div>
                      ) : (
                        <span
                          className="block size-full rounded-full border border-black/20 shadow-inner"
                          style={{ backgroundColor: c.hexCode }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={brochurePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-card transition-transform hover:scale-[1.02] shadow-sm"
              >
                <Download className="size-4" /> Download Official Brochure
              </a>
              <Link
                href="/compare?car1=hyundai-verna&car2=honda-city"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent shadow-xs"
              >
                <SlidersHorizontal className="size-4" /> Compare vs Honda City
              </Link>
              <Link
                href="/compare?car1=hyundai-verna&car2=skoda-slavia"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent shadow-xs"
              >
                <SlidersHorizontal className="size-4" /> Compare vs Slavia
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dealers");
                  const navEl = document.getElementById("verna-nav-tabs");
                  if (navEl) navEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-card shadow-xs"
              >
                <MapPin className="size-4" /> Find Dealers ({vehicle.dealers?.length || 0})
              </button>
            </div>
          </div>

          {/* Right: Vehicle Angle Display */}
          <div className="relative flex items-center justify-center lg:col-span-7">
            <div className="relative aspect-[16/10] min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] w-full max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-paper/80 via-card to-paper/40 p-4 lg:p-8 flex items-center justify-center border border-line/40 shadow-inner">
              <Image
                src={
                  imgError
                    ? "/vehicles/cars/hyundai/hyundai-verna/Verna/Atlas White.png"
                    : selectedColor.imageUrl || selectedColor.previewUrl
                }
                alt={`${vehicle.name} in ${selectedColor.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain drop-shadow-2xl transition-all duration-300"
                onError={() => setImgError(true)}
              />
            </div>
          </div>
        </div>

        {/* Quick Fact Badges */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line/70 pt-6 sm:grid-cols-3 lg:grid-cols-6 text-center">
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Max Turbo Power</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">160 PS</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Peak Torque</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">253 Nm</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Wheelbase</p>
            <p className="mt-1 font-display text-lg font-bold text-accent">2,670 mm*</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Boot Space</p>
            <p className="mt-1 font-display text-lg font-bold text-good">528 Litres*</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Transmissions</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">6MT / iVT / 7DCT</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Level 2 ADAS</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">17 Features</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. NAVIGATION TABS                                             */}
      {/* ============================================================== */}
      <nav id="verna-nav-tabs" className="flex space-x-2 border-b border-line pb-2 overflow-x-auto no-scrollbar scroll-mt-20">
        <button
          type="button"
          onClick={() => setActiveTab("powertrain")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "powertrain"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink hover:bg-paper"
          )}
        >
          <Gauge className="size-4" />
          Powertrains & Trim Plan
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "features"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink hover:bg-paper"
          )}
        >
          <Layers className="size-4" />
          Feature Matrix (6 Trims)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("progression")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "progression"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink hover:bg-paper"
          )}
        >
          <Sparkles className="size-4" />
          Trim Equipment Progression
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "pricing"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink hover:bg-paper"
          )}
        >
          <FileText className="size-4" />
          Variant Pricing (22 Variants)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dealers")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "dealers"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink hover:bg-paper"
          )}
        >
          <MapPin className="size-4" />
          Authorized Dealers ({vehicle.dealers?.length || 0})
        </button>
      </nav>

      {/* ============================================================== */}
      {/* TAB 1: POWERTRAINS & TRIM PLAN                                 */}
      {/* ============================================================== */}
      {activeTab === "powertrain" && (
        <section className="space-y-8">
          {/* Dual Powertrain Headline Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 1.5L MPi Naturally Aspirated */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8">
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink uppercase tracking-wider">
                Naturally Aspirated
              </span>
              <h3 className="mt-3 font-display text-2xl text-ink">
                1.5 l MPi Petrol
              </h3>
              <p className="mt-2 text-sm text-muted">
                Refined 4-cylinder Multi-Point Injection engine engineered for smooth linear acceleration, quiet city commuting, and optimal fuel economy.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-xs text-muted uppercase">Max Power</dt>
                  <dd className="font-bold text-ink">84.6 kW [115 PS] @ 6,300 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Max Torque</dt>
                  <dd className="font-bold text-ink">143.8 Nm @ 4,500 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Transmissions</dt>
                  <dd className="font-bold text-ink">6-Speed MT / iVT (CVT)</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">ARAI Fuel Economy</dt>
                  <dd className="font-bold text-good">18.60 km/l</dd>
                </div>
              </dl>
            </div>

            {/* 1.5L Turbo GDi */}
            <div className="relative overflow-hidden rounded-3xl border border-accent/40 bg-accent-soft/10 p-6 shadow-xs sm:p-8">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-accent px-4 py-1.5 text-xs font-bold text-card uppercase tracking-wider">
                Segment Most Powerful
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-card uppercase tracking-wider">
                Turbocharged Performance
              </span>
              <h3 className="mt-3 font-display text-2xl text-ink">
                1.5 l Turbo GDi Petrol
              </h3>
              <p className="mt-2 text-sm text-muted">
                Gasoline Direct Injection turbocharged engine delivering aggressive acceleration with 253 Nm of torque available from as low as 1,500 rpm.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-accent/20 pt-6 text-sm">
                <div>
                  <dt className="text-xs text-muted uppercase">Max Power</dt>
                  <dd className="font-bold text-accent">117.5 kW [160 PS] @ 5,500 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Max Torque</dt>
                  <dd className="font-bold text-accent">253 Nm @ 1,500 - 3,500 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Transmissions</dt>
                  <dd className="font-bold text-ink">6-Speed MT / 7-Speed DCT</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">ARAI Fuel Economy</dt>
                  <dd className="font-bold text-good">20.00 km/l</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Engine Specifications Side-by-Side Table */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8">
            <h3 className="font-display text-2xl text-ink">Engine Specifications Comparison</h3>
            <p className="mt-1 text-sm text-muted">
              Technical parameters from Engine.xlsx for MPi and Turbo GDi powertrains.
            </p>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper text-xs uppercase text-muted">
                  <tr>
                    <th className="p-4 font-semibold">Parameter</th>
                    <th className="p-4 font-semibold text-ink">1.5 l MPi Petrol</th>
                    <th className="p-4 font-semibold text-accent">1.5 l Turbo GDi Petrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {engineSpecs
                    .find((s) => s.category.includes("Specifications"))
                    ?.specs.map((row, idx) => (
                      <tr key={idx} className="hover:bg-paper/40">
                        <td className="p-4 font-medium text-ink">{row.parameter}</td>
                        <td className="p-4 text-muted">{row["1.5 l MPi Petrol"]}</td>
                        <td className="p-4 font-semibold text-ink">{row["1.5 l Turbo GDi Petrol"]}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine & Trim Plan Matrix */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8">
            <h3 className="font-display text-2xl text-ink">Engine & Trim Availability Plan</h3>
            <p className="mt-1 text-sm text-muted">
              Transmission and powertrain pairing across trims HX 2 through HX 10.
            </p>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-center text-sm">
                <thead className="bg-paper text-xs uppercase text-muted">
                  <tr>
                    <th className="p-4 text-left font-semibold">Engine Variant</th>
                    {TRIM_NAMES.map((t) => (
                      <th key={t} className="p-4 font-bold text-ink">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr className="hover:bg-paper/40">
                    <td className="p-4 text-left font-semibold text-ink">1.5 l MPi Petrol</td>
                    <td className="p-4"><span className="rounded-md bg-paper px-2.5 py-1 text-xs font-semibold text-ink">MT</span></td>
                    <td className="p-4"><span className="rounded-md bg-paper px-2.5 py-1 text-xs font-semibold text-ink">MT</span></td>
                    <td className="p-4"><span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">MT / iVT</span></td>
                    <td className="p-4"><span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">MT / iVT</span></td>
                    <td className="p-4"><span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">MT / iVT</span></td>
                    <td className="p-4"><span className="rounded-md bg-good-soft px-2.5 py-1 text-xs font-semibold text-good">iVT Only</span></td>
                  </tr>
                  <tr className="hover:bg-paper/40">
                    <td className="p-4 text-left font-semibold text-accent">1.5 l Turbo GDi Petrol</td>
                    <td className="p-4 text-muted">—</td>
                    <td className="p-4 text-muted">—</td>
                    <td className="p-4 text-muted">—</td>
                    <td className="p-4 text-muted">—</td>
                    <td className="p-4"><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-card">MT / DCT</span></td>
                    <td className="p-4"><span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-card">DCT Only</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TRIM FEATURE MATRIX (5 Categories, 6 Trims)             */}
      {/* ============================================================== */}
      {activeTab === "features" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Comprehensive Feature Matrix
              </h2>
              <p className="mt-1 text-sm text-muted">
                Detailed equipment catalog parsed across trims HX 2 to HX 10.
              </p>
            </div>

            {/* Differences Only Toggle */}
            <button
              type="button"
              onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors border",
                showDifferencesOnly
                  ? "border-accent bg-accent text-card"
                  : "border-line bg-card text-muted hover:text-ink"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              {showDifferencesOnly ? "Showing Differences Only" : "Show Differences Only"}
            </button>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {featureMatrix.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setActiveFeatureCategory(cat.category)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                    activeFeatureCategory === cat.category
                      ? "bg-ink text-card"
                      : "border border-line bg-card text-muted hover:text-ink"
                  )}
                >
                  {cat.category} ({cat.features.length})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search features (e.g. ADAS, Sunroof)..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                className="w-full rounded-xl border border-line bg-card py-2 pl-9 pr-4 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Feature Matrix Table */}
          <div className="overflow-x-auto rounded-3xl border border-line bg-card shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 z-10 border-b border-line bg-paper text-xs uppercase text-muted">
                <tr>
                  <th className="min-w-64 p-4 font-semibold text-ink">Feature Equipment</th>
                  {TRIM_NAMES.map((t) => (
                    <th key={t} className="min-w-28 p-4 text-center font-bold text-ink">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map((row, idx) => (
                    <tr key={idx} className="hover:bg-paper/40">
                      <td className="p-4 font-medium text-ink">
                        {row.feature}
                        {row.feature.includes("ADAS") && (
                          <span className="ml-2 inline-flex rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">
                            ADAS L2
                          </span>
                        )}
                        {row.feature.includes("Bose") && (
                          <span className="ml-2 inline-flex rounded-md bg-good-soft px-1.5 py-0.5 text-[10px] font-bold text-good">
                            Bose Audio
                          </span>
                        )}
                        {row.feature.includes("Ventilated") && (
                          <span className="ml-2 inline-flex rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-bold text-ink">
                            Ventilated
                          </span>
                        )}
                      </td>
                      {TRIM_NAMES.map((t) => {
                        const val = row.trims[t] || "—";
                        const isIncluded = val === "S" || val === "Standard";
                        const isNotAvailable = val === "—";

                        return (
                          <td key={t} className="p-4 text-center">
                            {isIncluded ? (
                              <span className="inline-flex items-center justify-center rounded-full bg-good-soft p-1 text-good">
                                <Check className="size-4 stroke-[2.5]" />
                              </span>
                            ) : isNotAvailable ? (
                              <span className="text-muted/60">—</span>
                            ) : (
                              <span className="inline-block rounded-md bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink">
                                {val}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-muted">
                      No features found matching &quot;{featureSearch}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRIM EQUIPMENT PROGRESSION                              */}
      {/* ============================================================== */}
      {activeTab === "progression" && (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Trim Hierarchy & Equipment Progression
            </h2>
            <p className="mt-1 text-sm text-muted">
              Discover what equipment is added with each step up the Hyundai Verna trim ladder.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* HX 2 */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">
                  Entry Trim
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">HX 2</h3>
                <p className="mt-1 text-xs text-muted">From ₹10,99,200</p>
                <div className="mt-4 border-t border-line pt-4 space-y-2 text-xs text-muted">
                  <p className="font-semibold text-ink">Standard Safety & Baseline:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>6 Airbags Standard (Front, Side, Curtain)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Electronic Stability Control (ESC) & VSM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Hill-Start Assist Control (HAC)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>All 4 Power Windows & Projector Headlamps</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HX 4 */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                  + Additions over HX 2
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">HX 4</h3>
                <p className="mt-1 text-xs text-muted">From ₹12,31,200</p>
                <div className="mt-4 border-t border-line pt-4 space-y-2 text-xs text-muted">
                  <p className="font-semibold text-ink">Key Added Equipment:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>8.0&quot; Touchscreen with Wireless Apple CarPlay & Android Auto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Fully Automatic Climate Control with Rear AC Vents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Electric Sunroof & LED DRLs / LED Tail Lamps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>R15 Silver Alloy Wheels & Idle Stop & Go (ISG)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HX 6 */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                  + Additions over HX 4
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">HX 6</h3>
                <p className="mt-1 text-xs text-muted">From ₹13,25,200</p>
                <div className="mt-4 border-t border-line pt-4 space-y-2 text-xs text-muted">
                  <p className="font-semibold text-ink">Key Added Equipment:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Smart Key with Push Button Start & Smart Trunk</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Rear View Camera with Dynamic Guidelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Dual LED Projector Headlamps & Ambient Lighting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>R16 Diamond Cut Alloys & Smartphone Wireless Charger</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HX 6+ */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                  + Additions over HX 6
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">HX 6+</h3>
                <p className="mt-1 text-xs text-muted">From ₹13,87,200</p>
                <div className="mt-4 border-t border-line pt-4 space-y-2 text-xs text-muted">
                  <p className="font-semibold text-ink">Key Added Equipment:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Front Ventilated Seats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Premium Leatherette Seat Upholstery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Paddle Shifters (on iVT Automatic)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Dual Tone Styling Package Available</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HX 8 */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-card">
                  Turbo Available
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">HX 8</h3>
                <p className="mt-1 text-xs text-muted">From ₹14,94,200 (MPi) / ₹16,34,200 (Turbo)</p>
                <div className="mt-4 border-t border-line pt-4 space-y-2 text-xs text-muted">
                  <p className="font-semibold text-ink">Key Added Equipment:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>1.5L Turbo GDi (160 PS / 253 Nm) option</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Bose Premium Sound 8-Speaker System</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>26.03 cm (10.25&quot;) HD Audio Video Navigation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Hyundai Blue Link Connected Car Tech & Rain Sensing Wipers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>ADAS Level 2 Suite on Turbo Trims</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* HX 10 */}
            <div className="relative overflow-hidden rounded-3xl border border-accent bg-accent-soft/10 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-card">
                  Top-of-the-Line Flagship
                </span>
                <h3 className="mt-3 font-display text-2xl text-ink">HX 10</h3>
                <p className="mt-1 text-xs text-muted">From ₹17,21,200 (iVT) / ₹18,31,200 (DCT)</p>
                <div className="mt-4 border-t border-accent/20 pt-4 space-y-2 text-xs text-muted">
                  <p className="font-semibold text-ink">Exclusive Flagship Features:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Hyundai SmartSense Level 2 ADAS Standard (17 Features)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Surround View Monitor (360° Camera) & Blind-Spot View Monitor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Dual 10.25&quot; Screens (Digital Cluster + Infotainment)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Front Center Airbag & Electric Parking Brake (EPB)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-3.5 text-good mt-0.5 shrink-0" />
                      <span>Powered Driver Seat with Memory Function</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 4: VARIANT PRICING GRID                                    */}
      {/* ============================================================== */}
      {activeTab === "pricing" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Variant Ex-Showroom & Estimated On-Road Prices
              </h2>
              <p className="mt-1 text-sm text-muted">
                Official Delhi ex-showroom pricing from Price-Ex-ShowRoom.xlsx with estimated on-road totals.
              </p>
            </div>

            {/* Transmission Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPricingTransmission("ALL")}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                  pricingTransmission === "ALL"
                    ? "bg-ink text-card"
                    : "border border-line bg-card text-muted hover:text-ink"
                )}
              >
                All Transmissions ({vehicle.variants.length})
              </button>
              <button
                type="button"
                onClick={() => setPricingTransmission("MT")}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                  pricingTransmission === "MT"
                    ? "bg-ink text-card"
                    : "border border-line bg-card text-muted hover:text-ink"
                )}
              >
                Manual MT (10)
              </button>
              <button
                type="button"
                onClick={() => setPricingTransmission("IVT")}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                  pricingTransmission === "IVT"
                    ? "bg-ink text-card"
                    : "border border-line bg-card text-muted hover:text-ink"
                )}
              >
                Automatic iVT (8)
              </button>
              <button
                type="button"
                onClick={() => setPricingTransmission("DCT")}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                  pricingTransmission === "DCT"
                    ? "bg-ink text-card"
                    : "border border-line bg-card text-muted hover:text-ink"
                )}
              >
                Turbo DCT (4)
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVariants.map((v) => {
              const isTurbo = v.powertrain?.toLowerCase().includes("turbo") || v.name.includes("Turbo");

              return (
                <div
                  key={v.id}
                  className={cn(
                    "flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md",
                    isTurbo ? "border-accent/40 bg-accent-soft/5" : "border-line"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold",
                          isTurbo ? "bg-accent text-card" : "bg-paper text-ink"
                        )}
                      >
                        {v.powertrain}
                      </span>
                      <span className="rounded-md border border-line bg-card px-2 py-0.5 text-xs font-semibold text-muted">
                        {v.transmission}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-bold text-ink">
                      {v.name}
                    </h3>

                    <div className="mt-4 border-t border-line/60 pt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted">Ex-Showroom:</span>
                        <span className="font-display text-2xl font-extrabold text-ink">
                          {formatInr(v.exShowroomPrice)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-xs text-muted">Est. On-Road Delhi:</span>
                        <span className="text-sm font-bold text-good">
                          {formatInr(v.onRoadPriceEst)}
                        </span>
                      </div>
                    </div>

                    {/* Key features */}
                    <div className="mt-4 border-t border-line/60 pt-3 space-y-1.5 text-xs text-muted">
                      {v.keyFeatures.slice(0, 3).map((feat, fIdx) => (
                        <p key={fIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="size-3.5 text-good mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60">
                    <Link
                      href={`/compare?car1=hyundai-verna&car2=honda-city`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      Compare with City <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 5: AUTHORIZED DEALER LOCATOR                               */}
      {/* ============================================================== */}
      {activeTab === "dealers" && (
        <VehicleDealerLocator
          dealers={vehicle.dealers ?? []}
          brandName={vehicle.brandName}
          brandSlug={vehicle.brandSlug}
          vehicleName={vehicle.name}
        />
      )}
    </div>
  );
}
