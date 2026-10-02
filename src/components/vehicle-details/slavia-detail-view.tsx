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

const SLAVIA_TRIMS = ["Classic", "Signature", "Sportline", "Prestige", "Monte Carlo"] as const;

export function SlaviaDetailView({ vehicle }: { vehicle: CatalogVehicle }) {
  const [activeTab, setActiveTab] = useState<TabKey>("powertrain");

  // Colors
  const colors: CatalogColor[] = vehicle.colors.length
    ? vehicle.colors
    : [
        {
          id: "white",
          name: "Candy White",
          hexCode: "#F8FAFC",
          previewUrl: "/vehicles/cars/skoda/skoda-slavia/Candy White.png",
          imageUrl: "/vehicles/cars/skoda/skoda-slavia/Candy White.png",
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
    featureMatrix[0]?.category || "Safety & Security"
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
        const vals = SLAVIA_TRIMS.map((t) => f.trims[t] || "—");
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
      return vehicle.variants.filter(
        (v) =>
          v.transmission.toLowerCase().includes("manual") ||
          v.name.includes("MT")
      );
    }
    if (pricingTransmission === "6AT") {
      return vehicle.variants.filter(
        (v) =>
          v.name.includes("6-AT") ||
          v.transmission.toLowerCase().includes("6-at") ||
          (v.name.includes("AT") && !v.name.includes("DSG"))
      );
    }
    if (pricingTransmission === "7DSG") {
      return vehicle.variants.filter(
        (v) =>
          v.name.includes("DSG") ||
          v.transmission.toLowerCase().includes("dsg") ||
          v.transmission.toLowerCase().includes("7-dsg")
      );
    }
    return vehicle.variants;
  }, [vehicle.variants, pricingTransmission]);

  const brochurePath = "/vehicles/cars/skoda/skoda-slavia/slavia.pdf";

  // Calculate EMI estimate (8.5% p.a., 60 months, 85% on-road loan)
  const calcEmi = (onRoad: number) => {
    const p = onRoad * 0.85;
    const r = 8.5 / 12 / 100;
    const n = 60;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

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
                  Škoda Auto India
                </span>
                <span className="flex items-center gap-1 rounded-full bg-good-soft px-2.5 py-0.5 text-xs font-semibold text-good">
                  <Shield className="size-3.5" /> 5-Star Global NCAP (Adult & Child)
                </span>
                <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink">
                  MQB-A0-IN Platform
                </span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {vehicle.name}
              </h1>
              <p className="mt-2 text-base text-muted">
                {vehicle.tagline ||
                  "Drive the Legend. European Dynamics, 150 PS TSI EVO Engine & Class-Leading 521L Boot."}
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
                12 Variants across 1.0L TSI (6MT/6AT) & 1.5L TSI EVO (7DSG)
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
                      <span
                        className="block size-full rounded-full border border-black/20 shadow-inner"
                        style={{ backgroundColor: c.hexCode }}
                      />
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
                href="/compare?car1=skoda-slavia&car2=honda-city"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent shadow-xs"
              >
                <SlidersHorizontal className="size-4" /> Compare vs City
              </Link>
              <Link
                href="/compare?car1=skoda-slavia&car2=hyundai-verna"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent shadow-xs"
              >
                <SlidersHorizontal className="size-4" /> Compare vs Verna
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dealers");
                  const navEl = document.getElementById("slavia-nav-tabs");
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
                    ? "/vehicles/cars/skoda/skoda-slavia/Candy White.png"
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
            <p className="mt-1 font-display text-lg font-bold text-ink">150 PS (1.5 EVO)</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Peak Torque</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">250 Nm</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Ground Clearance</p>
            <p className="mt-1 font-display text-lg font-bold text-accent">179 mm (Class Lead)</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Boot Space</p>
            <p className="mt-1 font-display text-lg font-bold text-good">521 L (1050 L Max)</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">ARAI Mileage</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">20.32 kmpl</p>
          </div>
          <div className="rounded-xl border border-line bg-card/60 p-3">
            <p className="text-[11px] font-semibold text-muted uppercase">Safety Rating</p>
            <p className="mt-1 font-display text-lg font-bold text-good">5★ GNCAP + 6 Airbags</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. NAVIGATION TABS                                             */}
      {/* ============================================================== */}
      <nav id="slavia-nav-tabs" className="flex space-x-2 border-b border-line pb-2 overflow-x-auto no-scrollbar scroll-mt-20">
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
          Powertrains & Technical Specs
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
          Trim Feature Matrix (5 Trims)
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
          Trim Ladder & Value Progression
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
          Variant Pricing & EMI Grid
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
      {/* TAB 1: POWERTRAIN & TECHNICAL SPECS                            */}
      {/* ============================================================== */}
      {activeTab === "powertrain" && (
        <div className="space-y-8">
          {/* Engine Dual Showcase Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 1.0L TSI */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">
                  Balanced Efficiency
                </span>
                <span className="text-xs font-semibold text-good">20.32 kmpl (MT)</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                1.0L TSI Turbo Petrol (3-Cylinder)
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Smooth, punchy, and highly efficient. Features a high-pressure turbocharger delivering instantaneous low-end response, making city cruising and highway overtakes effortless.
              </p>
              <div className="grid grid-cols-2 gap-3 border-t border-line/60 pt-4 text-xs">
                <div>
                  <span className="text-muted block">Displacement:</span>
                  <span className="font-bold text-ink">999 cc</span>
                </div>
                <div>
                  <span className="text-muted block">Max Power:</span>
                  <span className="font-bold text-ink">115 PS @ 5000-5500 rpm</span>
                </div>
                <div>
                  <span className="text-muted block">Peak Torque:</span>
                  <span className="font-bold text-ink">178 Nm @ 1750-4500 rpm</span>
                </div>
                <div>
                  <span className="text-muted block">Gearboxes:</span>
                  <span className="font-bold text-ink">6-Speed MT / 6-Speed AT</span>
                </div>
              </div>
            </div>

            {/* 1.5L TSI EVO */}
            <div className="rounded-3xl border border-accent/40 bg-accent-soft/10 p-6 shadow-xs sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-card">
                  Segment Performance Crown
                </span>
                <span className="text-xs font-bold text-accent">Active Cylinder Tech (ACT)</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink">
                1.5L TSI EVO Turbo Petrol (4-Cylinder)
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Enthusiast-grade performance paired with cutting-edge Active Cylinder Technology that seamlessly shuts down two cylinders under light loads to maximize fuel economy.
              </p>
              <div className="grid grid-cols-2 gap-3 border-t border-line/60 pt-4 text-xs">
                <div>
                  <span className="text-muted block">Displacement:</span>
                  <span className="font-bold text-ink">1,498 cc</span>
                </div>
                <div>
                  <span className="text-muted block">Max Power:</span>
                  <span className="font-bold text-accent">150 PS @ 5000-6000 rpm</span>
                </div>
                <div>
                  <span className="text-muted block">Peak Torque:</span>
                  <span className="font-bold text-accent">250 Nm @ 1600-3500 rpm</span>
                </div>
                <div>
                  <span className="text-muted block">Gearbox:</span>
                  <span className="font-bold text-ink">7-Speed DSG with Paddle Shifters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Technical Specifications from Engine.xlsx */}
          {engineSpecs.map((cat, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-3xl border border-line bg-card shadow-xs"
            >
              <div className="border-b border-line bg-paper/60 px-6 py-4">
                <h3 className="font-display text-lg font-bold text-ink">
                  {cat.category}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-line bg-paper/30 text-muted uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-6 font-semibold">Parameter</th>
                      <th className="py-3 px-6 font-bold text-ink">
                        1.0L TSI Petrol (3-Cyl)
                      </th>
                      <th className="py-3 px-6 font-bold text-accent">
                        1.5L TSI EVO Petrol (4-Cyl)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {cat.specs.map((row, rIdx) => {
                      const specMap = row as Record<string, string | undefined>;
                      const param = row.parameter || specMap["Parameter"] || "";
                      const tsi10 =
                        row.tsi10 ||
                        row["1.0L TSI Petrol (3-Cylinder)"] ||
                        specMap["1.0L TSI"] ||
                        "—";
                      const tsi15 =
                        row.tsi15 ||
                        row["1.5L TSI Petrol (4-Cylinder EVO)"] ||
                        specMap["1.5L TSI"] ||
                        "—";

                      return (
                        <tr key={rIdx} className="hover:bg-paper/20">
                          <td className="py-3 px-6 font-medium text-ink">{param}</td>
                          <td className="py-3 px-6 text-muted">{tsi10}</td>
                          <td className="py-3 px-6 font-semibold text-ink">{tsi15}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TRIM-BY-TRIM FEATURE MATRIX                             */}
      {/* ============================================================== */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {/* Controls: Search, Differences, Categories */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {featureMatrix.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveFeatureCategory(cat.category)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                      activeFeatureCategory === cat.category
                        ? "bg-ink text-card shadow-xs"
                        : "border border-line bg-paper text-muted hover:text-ink hover:bg-card"
                    )}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* Search & Differences Toggle */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search feature..."
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    className="w-48 sm:w-64 rounded-xl border border-line bg-paper py-2 pl-9 pr-3 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-hidden"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDifferencesOnly}
                    onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                    className="rounded border-line text-accent focus:ring-accent"
                  />
                  <span>Differences only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Feature Matrix Table */}
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-line bg-paper/60 text-muted uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold w-1/3">Feature</th>
                    {SLAVIA_TRIMS.map((trim) => (
                      <th
                        key={trim}
                        className={cn(
                          "py-3.5 px-4 font-bold text-center",
                          trim === "Monte Carlo"
                            ? "text-accent"
                            : trim === "Prestige"
                            ? "text-good"
                            : "text-ink"
                        )}
                      >
                        {trim}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredFeatures.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-sm text-muted"
                      >
                        No matching features found. Try clearing your search query or unchecking &quot;Differences only&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredFeatures.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-paper/20">
                        <td className="py-3.5 px-6 font-medium text-ink">
                          {row.feature}
                        </td>
                        {SLAVIA_TRIMS.map((trim) => {
                          const val = row.trims[trim] || "—";
                          const isYes =
                            val.toLowerCase() === "yes" ||
                            val.toLowerCase() === "s" ||
                            val.toLowerCase() === "standard";
                          const isNo = val === "—" || val.toLowerCase() === "no";

                          return (
                            <td key={trim} className="py-3.5 px-4 text-center">
                              {isYes ? (
                                <span className="inline-flex size-6 items-center justify-center rounded-full bg-good-soft text-good">
                                  <Check className="size-3.5" />
                                </span>
                              ) : isNo ? (
                                <span className="text-muted/60">—</span>
                              ) : (
                                <span
                                  className={cn(
                                    "rounded-md px-2 py-0.5 text-xs font-medium",
                                    trim === "Monte Carlo"
                                      ? "bg-accent-soft text-accent"
                                      : "bg-paper text-ink"
                                  )}
                                >
                                  {val}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRIM LADDER & VALUE PROGRESSION                         */}
      {/* ============================================================== */}
      {activeTab === "progression" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8">
            <h3 className="font-display text-2xl font-bold text-ink">
              Škoda Slavia Trim Hierarchy & Upgrade Path
            </h3>
            <p className="mt-1 text-sm text-muted">
              Step through the 5 trim levels to discover how equipment, luxury, and aesthetics scale from the base Classic to the flagship Monte Carlo.
            </p>

            <div className="mt-8 space-y-6">
              {/* Classic */}
              <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-ink px-2.5 py-1 text-xs font-bold text-card">
                      1. Classic
                    </span>
                    <h4 className="font-display text-lg font-bold text-ink">
                      Entry Gateway (₹9.99 Lakh)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-muted">1.0L TSI 6-MT</span>
                </div>
                <p className="text-xs text-muted">
                  Uncompromising core safety with 6 airbags, ESC, Multi-Collision Braking, and Electronic Differential Lock (XDS/XDS+) as standard.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "6 Airbags Standard",
                    "Electronic Stability Control (ESC)",
                    "MKB & XDS+ Differential Lock",
                    "7\" Touchscreen Infotainment",
                    "Rear AC Vents & Cooled Glovebox",
                    "15\" Steel Wheels with Full Covers",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-card px-2.5 py-1 border border-line text-ink font-medium"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Signature */}
              <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-ink px-2.5 py-1 text-xs font-bold text-card">
                      2. Signature
                    </span>
                    <h4 className="font-display text-lg font-bold text-ink">
                      The Smart Value Pick (₹13.44 – ₹14.44 Lakh)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-muted">1.0L TSI 6-MT / 6-AT</span>
                </div>
                <p className="text-xs text-muted">
                  Adds premium connected tech, larger 10&quot; touchscreen, electric sunroof, alloy wheels, and rear parking camera.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "10\" HD Screen with Wireless CarPlay/Android Auto",
                    "Electric Single-Pane Sunroof",
                    "16\" Silver Alloy Wheels",
                    "Climatronic Auto AC & Cruise Control",
                    "Rear View Camera with Guidelines",
                    "LED Headlamps with DRLs",
                    "Keyless Entry & Push Button Start",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-card px-2.5 py-1 border border-line text-ink font-medium"
                    >
                      + {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sportline */}
              <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-card">
                      3. Sportline
                    </span>
                    <h4 className="font-display text-lg font-bold text-ink">
                      Aggressive Black Styling (₹13.74 – ₹16.19 Lakh)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-muted">1.0L MT/AT & 1.5L DSG</span>
                </div>
                <p className="text-xs text-muted">
                  Brings blackened aesthetics, 8&quot; Virtual Cockpit, boot lip spoiler, and entry into the high-power 1.5L TSI EVO powertrain.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "Glossy Black Radiator Grille & Boot Lip Spoiler",
                    "16\" Glossy Black Alloy Wheels",
                    "8\" Digital Virtual Cockpit",
                    "Black Beltline Window Moulding",
                    "Dark Themed Interior Accents",
                    "Available 1.5L TSI EVO Engine (150 PS)",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-card px-2.5 py-1 border border-line text-ink font-medium"
                    >
                      + {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prestige */}
              <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-good px-2.5 py-1 text-xs font-bold text-card">
                      4. Prestige
                    </span>
                    <h4 className="font-display text-lg font-bold text-ink">
                      Executive Luxury & Comfort (₹15.44 – ₹18.04 Lakh)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-muted">1.0L MT/AT & 1.5L DSG</span>
                </div>
                <p className="text-xs text-muted">
                  Fully loaded luxury with front ventilated seats, powered front seats, dual-tone leatherette upholstery, and the 380W 8-speaker + subwoofer sound system.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "Front Ventilated Seats (Cooling)",
                    "Powered Driver & Co-Driver Seats",
                    "Škoda 380W 8-Speaker Sound + Subwoofer",
                    "Perforated Leatherette Upholstery",
                    "16\" Diamond Cut Alloy Wheels",
                    "Rain Sensing Wipers & Auto Headlamps",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-good-soft px-2.5 py-1 border border-good/20 text-good font-semibold"
                    >
                      + {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Monte Carlo */}
              <div className="rounded-2xl border border-accent/40 bg-accent-soft/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-card">
                      5. Monte Carlo
                    </span>
                    <h4 className="font-display text-lg font-bold text-ink">
                      Motorsport Heritage Flagship (₹15.00 – ₹18.29 Lakh)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-accent">Top-of-the-Line</span>
                </div>
                <p className="text-xs text-muted">
                  Commemorates Škoda’s 120-year motorsport legacy with exclusive Monte Carlo styling, dual-tone black roof, red cabin accents, dark alloys, and bespoke digital cockpit theme.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "Exclusive Monte Carlo Exterior Badge & Badging",
                    "16\" Dual-Tone Monte Carlo Alloys with Red Calipers",
                    "8\" Virtual Cockpit with Red Sport Theme",
                    "Sporty Monte Carlo Leatherette Seats with Red Contrast Accents",
                    "Red Ambient Interior Illumination",
                    "Škoda 380W Subwoofer Sound Suite",
                  ].map((f, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-accent-soft px-2.5 py-1 border border-accent/30 text-accent font-bold"
                    >
                      ★ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: VARIANT PRICING & EMI GRID                              */}
      {/* ============================================================== */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          {/* Transmission Filter Pills */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">
                Variant Price Spectrum
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Exact Ex-Showroom prices and estimated Delhi On-Road costs across 12 variants.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Gearboxes (12)" },
                { id: "MT", label: "Manual 6-MT (5)" },
                { id: "6AT", label: "Automatic 6-AT (4)" },
                { id: "7DSG", label: "Dual-Clutch 7-DSG (3)" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPricingTransmission(filter.id)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                    pricingTransmission === filter.id
                      ? "bg-ink text-card shadow-xs"
                      : "border border-line bg-paper text-muted hover:text-ink hover:bg-card"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Variants */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVariants.map((v) => {
              const onRoad = v.onRoadPriceEst || Math.round(v.exShowroomPrice * 1.15);
              const emi = calcEmi(onRoad);
              const is15L = v.name.includes("1.5L") || (v.powertrain && v.powertrain.includes("1.5"));

              return (
                <div
                  key={v.id}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-2xs hover:border-ink/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-bold",
                          is15L
                            ? "bg-accent-soft text-accent"
                            : "bg-paper text-ink"
                        )}
                      >
                        {is15L ? "1.5L TSI EVO (150 PS)" : "1.0L TSI (115 PS)"}
                      </span>
                      <span className="text-[11px] font-semibold text-muted">
                        {v.transmission}
                      </span>
                    </div>

                    <h4 className="mt-3 font-display text-lg font-bold text-ink">
                      {v.name}
                    </h4>

                    {/* Price Block */}
                    <div className="mt-3 space-y-1 rounded-xl bg-paper/60 p-3 border border-line/60">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted">Ex-Showroom:</span>
                        <span className="font-display text-lg font-extrabold text-ink">
                          {formatInr(v.exShowroomPrice)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-muted">Est. On-Road Delhi:</span>
                        <span className="font-bold text-good">
                          {formatInr(onRoad)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs pt-1 border-t border-line/40">
                        <span className="text-muted">Est. Monthly EMI (5yr):</span>
                        <span className="font-bold text-ink">
                          ~{formatInr(emi)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Key Features Bullet List */}
                    {v.keyFeatures && v.keyFeatures.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                          Key Equipment
                        </p>
                        <ul className="space-y-1 text-xs text-muted">
                          {v.keyFeatures.slice(0, 4).map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="size-3.5 text-good shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between">
                    <Link
                      href={`/compare?car1=skoda-slavia&car2=honda-city`}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      Compare with City <ChevronRight className="size-3" />
                    </Link>
                    <Link
                      href={`/compare?car1=skoda-slavia&car2=hyundai-verna`}
                      className="text-xs font-semibold text-muted hover:text-ink flex items-center gap-1"
                    >
                      vs Verna <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
