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

const CRETA_TRIMS = [
  "E",
  "EX",
  "EX(O)",
  "S(O)",
  "S(O) Knight",
  "SX",
  "SX Premium",
  "King",
  "King Knight",
  "Lounge Edition",
] as const;

export function CretaDetailView({ vehicle }: { vehicle: CatalogVehicle }) {
  const [activeTab, setActiveTab] = useState<TabKey>("powertrain");

  // Colors
  const colors: CatalogColor[] = vehicle.colors.length
    ? vehicle.colors
    : [
        {
          id: "emerald",
          name: "Robust Emerald Pearl",
          hexCode: "#0B3B24",
          previewUrl: "/vehicles/cars/hyundai/hyundai-creta/Robust Emerald Pearl.png",
          imageUrl: "/vehicles/cars/hyundai/hyundai-creta/Robust Emerald Pearl.png",
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
    featureMatrix[0]?.category || "Safety & ADAS (Level 2)"
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
        const values = Object.values(f.trims);
        const allSame = values.every((v) => v === values[0]);
        if (allSame) return false;
      }

      return true;
    });
  }, [featureMatrix, activeFeatureCategory, featureSearch, showDifferencesOnly]);

  // Filtered variants by transmission
  const filteredVariants = useMemo(() => {
    if (pricingTransmission === "ALL") return vehicle.variants;
    return vehicle.variants.filter((v) => {
      const trans = v.transmission.toLowerCase();
      if (pricingTransmission === "MANUAL") return trans.includes("manual") || trans.includes("mt");
      if (pricingTransmission === "IVT") return trans.includes("ivt") || trans.includes("cvt");
      if (pricingTransmission === "AT") return trans.includes("tc") || trans.includes("at");
      if (pricingTransmission === "DCT") return trans.includes("dct");
      return true;
    });
  }, [vehicle.variants, pricingTransmission]);

  const brochurePath = "/vehicles/cars/hyundai/hyundai-creta/brochure.pdf";

  return (
    <div className="space-y-10 pb-20">
      {/* ============================================================== */}
      {/* 1. BREADCRUMBS                                                 */}
      {/* ============================================================== */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/cars" className="hover:text-ink">
          Cars
        </Link>
        <ChevronRight className="size-4" />
        <span className="hover:text-ink">Hyundai</span>
        <ChevronRight className="size-4" />
        <span className="font-semibold text-ink">Hyundai Creta</span>
      </nav>

      {/* ============================================================== */}
      {/* 2. HERO SHOWCASE SECTION                                       */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Vehicle Title, Quick Badges & Actions */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent">
                <Sparkles className="size-3.5" /> India&apos;s Best-Selling Midsize SUV
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Hyundai Creta
              </h1>
              <p className="text-base text-muted sm:text-lg">
                The Undisputed King of SUVs — Now with Level 2 ADAS, 160 PS Turbo GDi, and Panoramic Sunroof.
              </p>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-line/60 bg-paper/60 p-4 sm:p-5">
              <div className="text-xs font-medium text-muted uppercase tracking-wider">
                Ex-Showroom Price (Delhi)
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl font-black text-ink sm:text-3xl">
                  {formatInr(vehicle.priceMin)} – {formatInr(vehicle.priceMax)}
                </span>
                <span className="text-xs text-muted">({vehicle.variants.length} Variants)</span>
              </div>
              <div className="mt-2 text-xs text-muted">
                Estimated On-Road:{" "}
                <span className="font-medium text-ink">
                  ₹12.54 Lakh – ₹23.17 Lakh
                </span>{" "}
                (incl. RTO & Insurance)
              </div>
            </div>

            {/* Key Spec Badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-line/50 bg-paper/40 p-2.5 text-center">
                <div className="text-[10px] text-muted uppercase">Max Power</div>
                <div className="mt-0.5 font-bold text-ink">115 - 160 PS</div>
              </div>
              <div className="rounded-xl border border-line/50 bg-paper/40 p-2.5 text-center">
                <div className="text-[10px] text-muted uppercase">Max Torque</div>
                <div className="mt-0.5 font-bold text-ink">144 - 253 Nm</div>
              </div>
              <div className="rounded-xl border border-line/50 bg-paper/40 p-2.5 text-center">
                <div className="text-[10px] text-muted uppercase">Mileage</div>
                <div className="mt-0.5 font-bold text-good">Up to 21.8 km/l</div>
              </div>
              <div className="rounded-xl border border-line/50 bg-paper/40 p-2.5 text-center">
                <div className="text-[10px] text-muted uppercase">Global NCAP</div>
                <div className="mt-0.5 flex items-center justify-center gap-1 font-bold text-ink">
                  <Shield className="size-3 text-good fill-good" /> 5-Star Ready
                </div>
              </div>
            </div>

            {/* Color Palette Switcher */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Exterior Color
                </span>
                <span className="text-xs font-medium text-ink">
                  {selectedColor.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {colors.map((c) => {
                  const isSelected = c.id === selectedColor.id;
                  const isDualTone = c.name.includes("Black Roof") || c.name.includes("Dual Tone");
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
                href="/compare?car1=hyundai-creta&car2=kia-seltos"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent shadow-xs"
              >
                <SlidersHorizontal className="size-4" /> Compare vs Seltos
              </Link>
              <Link
                href="/compare?car1=hyundai-creta&car2=maruti-grand-vitara"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent shadow-xs"
              >
                <SlidersHorizontal className="size-4" /> Compare vs Grand Vitara
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dealers");
                  const navEl = document.getElementById("creta-nav-tabs");
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
                src={imgError ? vehicle.heroImage : selectedColor.previewUrl}
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
      </section>

      {/* ============================================================== */}
      {/* 3. NAVIGATION TABS                                             */}
      {/* ============================================================== */}
      <nav
        id="creta-nav-tabs"
        aria-label="Creta Details Navigation"
        className="flex items-center gap-2 overflow-x-auto border-b border-line pb-2 scrollbar-none"
      >
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
          Feature Matrix ({featureMatrix.reduce((a, b) => a + b.features.length, 0)} Features)
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
          Variant Pricing ({vehicle.variants.length} Variants)
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
          {/* Triple Powertrain Headline Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* 1.5L MPi Naturally Aspirated */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs">
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
                  <dd className="font-bold text-ink">84.4 kW [115 PS] @ 6,300 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Max Torque</dt>
                  <dd className="font-bold text-ink">143.8 Nm @ 4,500 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Transmissions</dt>
                  <dd className="font-bold text-ink">6-Speed MT / IVT (Auto)</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">ARAI Mileage</dt>
                  <dd className="font-bold text-good">17.4 – 17.7 km/l</dd>
                </div>
              </dl>
            </div>

            {/* 1.5L U2 CRDi Diesel */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-xs">
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink uppercase tracking-wider">
                Torquey & Efficient
              </span>
              <h3 className="mt-3 font-display text-2xl text-ink">
                1.5 l CRDi Diesel
              </h3>
              <p className="mt-2 text-sm text-muted">
                High-torque Common Rail Direct Injection diesel delivering effortless low-end pull with 250 Nm of torque and outstanding long-distance mileage.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-xs text-muted uppercase">Max Power</dt>
                  <dd className="font-bold text-ink">85 kW [116 PS] @ 4,000 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Max Torque</dt>
                  <dd className="font-bold text-ink">250 Nm @ 1,500 - 2,750 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Transmissions</dt>
                  <dd className="font-bold text-ink">6-Speed MT / 6-Speed AT</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">ARAI Mileage</dt>
                  <dd className="font-bold text-good">19.1 – 21.8 km/l</dd>
                </div>
              </dl>
            </div>

            {/* 1.5L Turbo GDi */}
            <div className="relative overflow-hidden rounded-3xl border border-accent/40 bg-accent-soft/10 p-6 shadow-xs">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-accent px-4 py-1.5 text-xs font-bold text-card uppercase tracking-wider">
                Segment Most Powerful
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-card uppercase tracking-wider">
                Turbo Performance
              </span>
              <h3 className="mt-3 font-display text-2xl text-ink">
                1.5 l Turbo GDi
              </h3>
              <p className="mt-2 text-sm text-muted">
                Gasoline Direct Injection turbocharged engine producing segment-leading 160 PS power paired exclusively with a lightning-fast 7-speed dual-clutch transmission.
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
                  <dd className="font-bold text-ink">7-Speed DCT</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">ARAI Mileage</dt>
                  <dd className="font-bold text-good">18.4 km/l</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Engine Specifications Side-by-Side Table */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8">
            <h3 className="font-display text-2xl text-ink">Engine Specifications Comparison</h3>
            <p className="mt-1 text-sm text-muted">
              Technical parameters parsed from Creta Engine.txt across MPi Petrol, CRDi Diesel, and Turbo GDi powertrains.
            </p>

            <div className="mt-6 space-y-8">
              {engineSpecs.map((catGroup) => (
                <div key={catGroup.category} className="space-y-3">
                  <h4 className="border-b border-line pb-2 font-display text-base font-bold text-ink">
                    {catGroup.category}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-line/60 bg-paper/50 text-xs font-semibold text-muted uppercase">
                          <th className="py-3 px-4">Parameter</th>
                          <th className="py-3 px-4">1.5 l MPi Petrol</th>
                          <th className="py-3 px-4">1.5 l U2 CRDi Diesel</th>
                          <th className="py-3 px-4">1.5 l Turbo GDi Petrol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/40">
                        {catGroup.specs.map((row, idx) => (
                          <tr key={idx} className="hover:bg-paper/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-ink">{row.parameter}</td>
                            <td className="py-3 px-4 text-muted">{row["1.5 l MPi Petrol"] || "—"}</td>
                            <td className="py-3 px-4 text-muted">{row["1.5 l U2 CRDi Diesel"] || "—"}</td>
                            <td className="py-3 px-4 text-muted">{row["1.5 l Turbo GDi Petrol"] || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FEATURE MATRIX                                          */}
      {/* ============================================================== */}
      {activeTab === "features" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl text-ink">Comprehensive Feature Matrix</h3>
              <p className="mt-1 text-sm text-muted">
                Official trim-by-trim equipment distribution from Hyundai CRETA Car Features.txt across all 10 trims.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer bg-paper px-3 py-2 rounded-xl border border-line">
                <input
                  type="checkbox"
                  checked={showDifferencesOnly}
                  onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                Show Differences Only
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  className="rounded-xl border border-line bg-card pl-9 pr-4 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-line pb-2 scrollbar-none">
            {featureMatrix.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveFeatureCategory(cat.category)}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                  activeFeatureCategory === cat.category
                    ? "bg-ink text-card"
                    : "text-muted hover:bg-paper hover:text-ink"
                )}
              >
                {cat.category} ({cat.features.length})
              </button>
            ))}
          </div>

          {/* Feature Matrix Table */}
          <div className="overflow-x-auto rounded-3xl border border-line bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-paper/60 font-bold uppercase tracking-wider text-muted">
                  <th className="py-4 px-4 sticky left-0 bg-paper/95 backdrop-blur-xs min-w-[240px] z-10">
                    Feature Name
                  </th>
                  {CRETA_TRIMS.map((t) => (
                    <th key={t} className="py-4 px-3 text-center min-w-[85px]">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filteredFeatures.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-sm text-muted">
                      No features matching the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFeatures.map((f, idx) => (
                    <tr key={idx} className="hover:bg-paper/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-ink sticky left-0 bg-card/95 backdrop-blur-xs z-10">
                        {f.feature}
                      </td>
                      {CRETA_TRIMS.map((t) => {
                        const val = f.trims[t] || "—";
                        const isStd = val === "Standard" || val === "S";
                        const isAvail = val === "Available" || val === "●";
                        const isNone = val === "—" || val === "-";
                        return (
                          <td key={t} className="py-3 px-3 text-center">
                            {isStd ? (
                              <span className="inline-flex items-center justify-center size-6 rounded-full bg-good/10 text-good" title="Standard">
                                <Check className="size-3.5 stroke-[3]" />
                              </span>
                            ) : isAvail ? (
                              <span className="inline-flex items-center justify-center size-6 rounded-full bg-accent/10 text-accent font-bold text-xs" title="Available">
                                ●
                              </span>
                            ) : isNone ? (
                              <span className="text-muted/40">—</span>
                            ) : (
                              <span className="text-[11px] font-medium text-ink">
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
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRIM EQUIPMENT PROGRESSION                              */}
      {/* ============================================================== */}
      {activeTab === "progression" && (
        <section className="space-y-6">
          <div>
            <h3 className="font-display text-2xl text-ink">Trim Ladder & Equipment Progression</h3>
            <p className="mt-1 text-sm text-muted">
              Understand the step-up value proposition: what each trim adds over the previous variant.
            </p>
          </div>

          <div className="space-y-4">
            {/* Trim E */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted uppercase">
                    Base Variant
                  </span>
                  <h4 className="mt-1 font-display text-xl font-bold text-ink">
                    Creta E (Starts at ₹11.00 Lakh)
                  </h4>
                </div>
                <div className="text-xs text-muted">Standard Foundation</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-good mt-0.5" />
                  <span><strong>6 Airbags Standard</strong> (Driver, Passenger, Side & Curtain)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-good mt-0.5" />
                  <span><strong>All-Wheel Disc Brakes</strong> with ABS and EBD</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-good mt-0.5" />
                  <span>Electronic Stability Control (ESC) & Hill Start Assist (HAC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-good mt-0.5" />
                  <span>Tyre Pressure Monitoring System (TPMS) Highline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-good mt-0.5" />
                  <span>All 4 Power Windows & Central Locking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-good mt-0.5" />
                  <span>Idle Stop & Go (ISG) & Front/Rear USB C-Type Ports</span>
                </li>
              </ul>
            </div>

            {/* Trim EX */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent uppercase">
                    Step Up 1
                  </span>
                  <h4 className="mt-1 font-display text-xl font-bold text-ink">
                    Creta EX (Over E: +₹1.28 Lakh)
                  </h4>
                </div>
                <div className="text-xs text-muted">Tech & Convenience Essentials</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>20.32 cm (8.0&quot;) Touchscreen</strong> Infotainment System</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Wireless Android Auto & Apple CarPlay Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Steering Wheel Mounted Audio & Bluetooth Controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Electrically Adjustable Outside Door Mirrors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Shark Fin Antenna & Sunglass Holder</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Front & Rear 4 Speakers with Front Tweeters</span>
                </li>
              </ul>
            </div>

            {/* Trim S(O) */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent uppercase">
                    Step Up 2
                  </span>
                  <h4 className="mt-1 font-display text-xl font-bold text-ink">
                    Creta S(O) (Over EX: +₹2.04 Lakh)
                  </h4>
                </div>
                <div className="text-xs text-muted">Sunroof & Dual-Zone Climate</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>Smart Panoramic Sunroof</strong> with One-Touch Operation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>Dual Zone Automatic Temperature Control (DATC)</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Quad Beam LED Headlamps & Horizon LED Positioning DRLs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>R17 (D=436.6 mm) Black Alloy Wheels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Rear Camera with Dynamic Guidelines & Dash Cam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Electric Parking Brake (EPB) with Auto Hold (IVT/AT)</span>
                </li>
              </ul>
            </div>

            {/* Trim SX */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent uppercase">
                    Step Up 3
                  </span>
                  <h4 className="mt-1 font-display text-xl font-bold text-ink">
                    Creta SX & SX Tech (Over S(O): +₹0.98 Lakh)
                  </h4>
                </div>
                <div className="text-xs text-muted">Connected Car & Navigation</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>26.03 cm (10.25&quot;) HD Navigation</strong> Infotainment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Voice-Enabled Smart Panoramic Sunroof</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Hyundai Bluelink Connected Car Tech (70+ Features)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>R17 Diamond Cut Alloy Wheels & Chrome Door Handles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Smartphone Wireless Charger with Cooling Pad</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Sequential LED Turn Signals & Puddle Lamps</span>
                </li>
              </ul>
            </div>

            {/* Trim SX Premium */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent uppercase">
                    Step Up 4
                  </span>
                  <h4 className="mt-1 font-display text-xl font-bold text-ink">
                    Creta SX Premium (Over SX: +₹3.50 Lakh)
                  </h4>
                </div>
                <div className="text-xs text-muted">Bose Sound & 360° Vision</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>Bose Premium 8-Speaker Audio</strong> with Subwoofer & Central Speaker</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>Surround View Monitor (360° Camera)</strong> with 3D Guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Blind-Spot View Monitor (BVM) in Instrument Cluster</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Front Row Ventilated Seats with Multi-Stage Control</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Front Parking Sensors & 10.25&quot; Full Digital Cluster</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Leatherette Upholstery with Soft-Touch Dashboard</span>
                </li>
              </ul>
            </div>

            {/* Trim King */}
            <div className="rounded-2xl border-2 border-accent bg-accent-soft/10 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-card uppercase">
                    Flagship Top-of-the-Line
                  </span>
                  <h4 className="mt-1 font-display text-xl font-bold text-ink">
                    Creta King & King Knight (₹20.00 – ₹20.15 Lakh)
                  </h4>
                </div>
                <div className="text-xs font-semibold text-accent">Full Level 2 ADAS + 160 PS Turbo</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>Hyundai SmartSense Full Level 2 ADAS (19 Features)</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Smart Cruise Control with Stop & Go (SCC with S&G)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Forward Collision-Avoidance Assist (Car, Pedestrian, Cycle & Junction)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Lane Keeping Assist (LKA) & Lane Following Assist (LFA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Blind-Spot Collision-Avoidance Assist (BCA) & Rear Cross-Traffic (RCCA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span><strong>8-Way Power Adjustable Driver Seat</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>R18 (D=462 mm) Diamond Cut / Matte Black Alloys</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-accent mt-0.5" />
                  <span>Rear Seat Wireless Charger & Rain Sensing Wipers</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 4: VARIANT PRICING                                         */}
      {/* ============================================================== */}
      {activeTab === "pricing" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl text-ink">Variant Price List (Delhi Ex-Showroom)</h3>
              <p className="mt-1 text-sm text-muted">
                Official price breakdown across {vehicle.variants.length} configurations spanning Petrol, Diesel, and Turbo powertrains.
              </p>
            </div>

            {/* Transmission Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-card p-1.5">
              {[
                { label: "All Transmissions", val: "ALL" },
                { label: "Manual (6-MT)", val: "MANUAL" },
                { label: "Auto IVT", val: "IVT" },
                { label: "Diesel Auto (6-AT)", val: "AT" },
                { label: "Turbo DCT", val: "DCT" },
              ].map((pill) => (
                <button
                  key={pill.val}
                  type="button"
                  onClick={() => setPricingTransmission(pill.val)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    pricingTransmission === pill.val
                      ? "bg-ink text-card"
                      : "text-muted hover:text-ink hover:bg-paper"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variant Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVariants.map((variant) => {
              const isBase = variant.name.includes("Creta E");
              const isTop = variant.name.includes("Creta King");
              return (
                <div
                  key={variant.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md",
                    isTop
                      ? "border-accent/60 bg-accent-soft/5"
                      : isBase
                      ? "border-good/50"
                      : "border-line"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-base font-bold text-ink">
                        {variant.name}
                      </h4>
                      <span className="shrink-0 rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-bold text-ink uppercase">
                        {variant.transmission}
                      </span>
                    </div>

                    <div className="text-xs text-muted">
                      Powertrain: <span className="font-medium text-ink">{variant.powertrain}</span>
                    </div>

                    {/* Price Block */}
                    <div className="rounded-xl border border-line/50 bg-paper/50 p-3">
                      <div className="text-[10px] text-muted uppercase">Ex-Showroom Price</div>
                      <div className="font-display text-xl font-extrabold text-ink">
                        {formatInr(variant.exShowroomPrice)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        Est. On-Road:{" "}
                        <span className="font-semibold text-ink">
                          {formatInr(variant.onRoadPriceEst || variant.exShowroomPrice * 1.14)}
                        </span>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                        Key Features Included:
                      </div>
                      <ul className="space-y-1 text-xs text-muted">
                        {variant.keyFeatures.map((kf, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="size-3.5 shrink-0 text-good mt-0.5" />
                            <span>{kf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-line/60 pt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-good">
                      {variant.mileageKmpl ? `${variant.mileageKmpl} km/l ARAI` : "Fuel Efficient"}
                    </span>
                    <a
                      href="#lead-capture"
                      className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-card transition-colors hover:bg-accent"
                    >
                      Get Best Deal
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 5: AUTHORIZED DEALERS                                      */}
      {/* ============================================================== */}
      {activeTab === "dealers" && (
        <section className="space-y-6">
          <div>
            <h3 className="font-display text-2xl text-ink">Hyundai Authorized Dealerships</h3>
            <p className="mt-1 text-sm text-muted">
              Connect with verified Hyundai 3S facilities for test drives, official quotations, and spot financing.
            </p>
          </div>

          <VehicleDealerLocator
            vehicleName="Hyundai Creta"
            brandSlug="hyundai"
            brandName="Hyundai India"
            dealers={vehicle.dealers}
          />
        </section>
      )}
    </div>
  );
}
