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
  Fuel,
  Gauge,
  HelpCircle,
  Layers,
  MapPin,
  Palette,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import type {
  CatalogColor,
  CatalogVehicle,
  EngineSpecCategory,
  FeatureCategory,
} from "@/lib/requirements";
import { dealerCityOptions } from "@/lib/requirements";
import { AddToCompare } from "@/components/add-to-compare";
import { LeadCapture } from "@/components/lead-capture";
import { VehicleDealerLocator } from "@/components/dealers/vehicle-dealer-locator";
import { cn, formatInr } from "@/lib/utils";

type TabKey =
  | "overview"
  | "specs"
  | "features"
  | "comparator"
  | "pricing"
  | "dealers";

function getPrecedingTrimDifferences(variantName: string): {
  preceding: string;
  additions: string[];
} {
  if (variantName.includes("e:HEV ZX+")) {
    return {
      preceding: "i-VTEC CVT ZX+",
      additions: [
        "Self-Charging Strong Hybrid SHEV Powertrain (Atkinson Cycle + Dual Electric Motors)",
        "27.26 km/l ARAI Certified Fuel Economy (vs 17.97 km/l Petrol CVT)",
        "Electric Parking Brake (EPB) with Automatic Brake Hold",
        "All 4 Wheels Disc Brakes (Front Ventilated + Rear Solid Disc)",
        "Deceleration Selector Paddle Shifters for Battery Regeneration Control",
        "Active Front Seat Ventilation System",
        "Exclusive Sporty Leather Seat Design & Contemporary Two-Tone Accents",
        "AVAS (Acoustic Vehicle Alerting System at low-speed EV mode)",
      ],
    };
  }
  if (variantName.includes("ZX+")) {
    return {
      preceding: "ZX",
      additions: [
        "360-degree Surround-Vision Camera (Multi-View with Dynamic Guidelines & MOD)",
        "Aero-Blade Front Bumper Air Curtains & Black Painted Lower Garnish",
        "Body Coloured Trunk Lip Spoiler & Gloss-Black Trunk Centre Moulding",
      ],
    };
  }
  if (variantName.includes("ZX")) {
    return {
      preceding: "VX",
      additions: [
        "Blade-Eye Signature Bi-LED Projector Headlamps with Integrated Split DRL",
        "Auto-Dimming Inside Rear View Mirror (Day/Night IRVM)",
        "Advanced Auto-Wiper System with Rain Sensor",
        "Luxurious Ivory & Black Two-Tone Leather Upholstery",
        "Smooth Leather Steering Wheel & Shift Lever Boot with Contrast Stitch",
        "Hand-wrapped Leather Soft Pads on Dashboard Mid-Pad & Centre Console",
        "Ambient Cabin Illumination (Dashboard, Display Audio & Footwell)",
      ],
    };
  }
  if (variantName.includes("VX")) {
    return {
      preceding: "V",
      additions: [
        "One-Touch Electric Sunroof with Slide/Tilt Function & Pinch Guard",
        "LaneWatch™ Blind Spot Monitoring Camera",
        "Front Grille Connected Centre Light Bar (LED Position Lamp)",
        "Aero-Blade Diamond Cut R16 Alloy Wheels (Berlina Black & Dark-Clear Cut)",
        "Wireless Smartphone Charger (Plug & Play Type)",
        "Rear Passenger Sunshade",
      ],
    };
  }
  if (variantName.includes("V")) {
    return {
      preceding: "SV",
      additions: [
        "Honda SENSING ADAS Suite (Collision Mitigation Braking, Adaptive Cruise, LKAS)",
        "Touch-Sensor Based Smart Keyless Access & Walk Away Auto Lock",
        "Multi-Angle Rear Camera with Guidelines (Normal, Wide, Top-Down)",
        "Multi-Spoke Gray Painted R15 Alloy Wheels",
        "AC Vent Knobs & Inside Door Handles Chrome Finish",
      ],
    };
  }
  return {
    preceding: "Base Standard",
    additions: [
      "Standard 6 Airbags System (Dual Front i-SRS, Front Side, Side Curtain)",
      "Vehicle Stability Assist (VSA) with Electronic Stability & Traction Control",
      "Hill Start Assist (HSA) & Agile Handling Assist (AHA)",
      "Rear Parking Sensors & Anti-Lock Brake System (ABS with EBD & BA)",
      "Fully Automatic Climate Control with MAX COOL & Click-Feel Dials",
      "All 4 Power Windows with Driver Auto Open/Close & Pinch Guard",
    ],
  };
}

export function VehicleDetailView({ vehicle }: { vehicle: CatalogVehicle }) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Colors
  const colors: CatalogColor[] = vehicle.colors.length
    ? vehicle.colors
    : [
        {
          id: "hero",
          name: "Platinum White Pearl",
          hexCode: "#F3F4F6",
          previewUrl: vehicle.heroImage,
          imageUrl: vehicle.heroImage,
        },
      ];
  const [selectedColorId, setSelectedColorId] = useState<string>(colors[0].id);
  const selectedColor =
    colors.find((c) => c.id === selectedColorId) ?? colors[0];
  const [imgError, setImgError] = useState(false);

  // Deep specs & features
  const engineSpecs: EngineSpecCategory[] = useMemo(
    () => vehicle.engineSpecs ?? [],
    [vehicle.engineSpecs]
  );
  const featureMatrix: FeatureCategory[] = useMemo(
    () => vehicle.featureMatrix ?? [],
    [vehicle.featureMatrix]
  );

  // Specs Tab state
  const [activeSpecCategory, setActiveSpecCategory] = useState<string>("All");
  const [specSearch, setSpecSearch] = useState<string>("");

  // Features Tab state
  const [activeFeatureCategory, setActiveFeatureCategory] =
    useState<string>("All");
  const [featureSearch, setFeatureSearch] = useState<string>("");
  const [showDifferencesOnly, setShowDifferencesOnly] =
    useState<boolean>(false);

  // Comparator Tab state
  const trimList = useMemo(() => ["SV", "V", "VX", "ZX", "ZX+"], []);
  const [trimA, setTrimA] = useState<string>("V");
  const [trimB, setTrimB] = useState<string>("ZX+");

  // Pricing & Dealers
  const [expandedDiffVariant, setExpandedDiffVariant] = useState<string | null>(null);
  const cities = useMemo(
    () => dealerCityOptions(vehicle.dealers),
    [vehicle.dealers]
  );

  // Filtered Specs
  const filteredSpecs = useMemo(() => {
    return engineSpecs
      .filter((cat) =>
        activeSpecCategory === "All" ? true : cat.category === activeSpecCategory
      )
      .map((cat) => {
        if (!specSearch.trim()) return cat;
        const q = specSearch.toLowerCase();
        const matchedSpecs = cat.specs.filter(
          (s) =>
            s.parameter.toLowerCase().includes(q) ||
            (s.eHev || "").toLowerCase().includes(q) ||
            (s.iVtec || "").toLowerCase().includes(q)
        );
        return { ...cat, specs: matchedSpecs };
      })
      .filter((cat) => cat.specs.length > 0);
  }, [engineSpecs, activeSpecCategory, specSearch]);

  // Filtered Feature Matrix
  const filteredFeatures = useMemo(() => {
    return featureMatrix
      .filter((cat) =>
        activeFeatureCategory === "All"
          ? true
          : cat.category === activeFeatureCategory
      )
      .map((cat) => {
        let list = cat.features;
        if (featureSearch.trim()) {
          const q = featureSearch.toLowerCase();
          list = list.filter((f) => f.feature.toLowerCase().includes(q));
        }
        if (showDifferencesOnly) {
          list = list.filter((f) => {
            const vals = Object.values(f.trims);
            // Check if all trim values are identical
            const allSame = vals.every((v) => v === vals[0]);
            return !allSame;
          });
        }
        return { ...cat, features: list };
      })
      .filter((cat) => cat.features.length > 0);
  }, [featureMatrix, activeFeatureCategory, featureSearch, showDifferencesOnly]);

  // Trim-to-Trim comparison differences
  const trimComparisonData = useMemo(() => {
    const allFeatures: { category: string; feature: string; valA: string; valB: string }[] = [];
    featureMatrix.forEach((cat) => {
      cat.features.forEach((f) => {
        const valA = f.trims[trimA] || "—";
        const valB = f.trims[trimB] || "—";
        allFeatures.push({
          category: cat.category,
          feature: f.feature,
          valA,
          valB,
        });
      });
    });

    const upgradedInB = allFeatures.filter(
      (item) => item.valA === "—" && item.valB !== "—"
    );
    const upgradedInA = allFeatures.filter(
      (item) => item.valB === "—" && item.valA !== "—"
    );
    const bothHave = allFeatures.filter(
      (item) => item.valA !== "—" && item.valB !== "—"
    );

    // Variants belonging to Trim A and Trim B
    const variantsA = vehicle.variants.filter((v) => v.name.includes(trimA));
    const variantsB = vehicle.variants.filter((v) => v.name.includes(trimB));

    return { upgradedInB, upgradedInA, bothHave, variantsA, variantsB };
  }, [featureMatrix, trimA, trimB, vehicle.variants]);

  // Brochure URL
  const brochureUrl = "/vehicles/cars/honda-cars/honda-city/brochure.pdf";

  return (
    <div className="space-y-8 pb-20">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/cars" className="hover:text-ink">
          Cars
        </Link>
        <ChevronRight className="size-4" />
        <span className="hover:text-ink">{vehicle.brandName}</span>
        <ChevronRight className="size-4" />
        <span className="font-semibold text-ink">{vehicle.name}</span>
      </nav>

      {/* Hero & Interactive Color Studio */}
      <header className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
        <div className="grid lg:grid-cols-12">
          {/* Left: Interactive 360 / Color Visualizer */}
          <div className="relative flex min-h-[360px] flex-col justify-between bg-[#ece7dd] p-6 lg:col-span-7 lg:min-h-[480px] lg:p-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1 text-xs font-semibold tracking-wider text-ink uppercase backdrop-blur-sm">
                <Palette className="size-3.5 text-accent" />
                Color Studio
              </span>
              <span className="text-xs font-medium text-muted">
                Official Renders
              </span>
            </div>

            {/* Vehicle Color Image */}
            <div className="relative my-auto flex h-72 sm:h-96 lg:h-[440px] w-full items-center justify-center p-2">
              <Image
                key={selectedColor.id}
                src={
                  imgError
                    ? "/vehicles/placeholder.svg"
                    : selectedColor.imageUrl || selectedColor.previewUrl
                }
                alt={`${vehicle.name} in ${selectedColor.name}`}
                fill
                priority
                sizes="(min-width: 1024px) 700px, 100vw"
                className="object-contain drop-shadow-2xl transition-all duration-300"
                onError={() => setImgError(true)}
              />
            </div>

            {/* Color Swatch Selector Strip */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card/90 p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div
                  className="size-5 rounded-full border border-black/15 shadow-inner"
                  style={{ backgroundColor: selectedColor.hexCode }}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {selectedColor.name}
                  </p>
                  <p className="font-mono text-xs uppercase text-muted">
                    {selectedColor.hexCode}
                  </p>
                </div>
              </div>

              {/* Swatch Buttons */}
              <div className="flex items-center gap-2">
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
                      title={c.name}
                      className={cn(
                        "group relative size-8 rounded-full border-2 transition-transform hover:scale-110",
                        isSelected
                          ? "border-accent ring-2 ring-accent/30 ring-offset-2"
                          : "border-black/20"
                      )}
                      style={{ backgroundColor: c.hexCode }}
                    >
                      <span className="sr-only">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Vehicle Info & High-Level Specifications */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5">
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {vehicle.bodyType}
                </span>
                <span className="rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good">
                  5-Star Safety
                </span>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink">
                  Delhi Ex-Showroom
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
                  {vehicle.brandName}
                </p>
                <h1 className="mt-1 font-display text-4xl text-ink sm:text-5xl">
                  {vehicle.name}
                </h1>
                <p className="mt-2 text-base text-muted">
                  {vehicle.tagline ||
                    "Supreme Performance. Iconic Comfort. Honda SENSING ADAS & Self-Charging Strong Hybrid."}
                </p>
              </div>

              {/* Price Banner */}
              <div className="rounded-2xl border border-line bg-paper/60 p-4">
                <p className="text-xs font-medium tracking-wider text-muted uppercase">
                  Ex-Showroom Delhi Range
                </p>
                <p className="mt-1 font-display text-3xl text-ink">
                  {formatInr(vehicle.priceMin)} – {formatInr(vehicle.priceMax)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Includes 9 variants across i-VTEC Petrol & e:HEV Strong Hybrid
                </p>
              </div>

              {/* Key Spec Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-line p-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Zap className="size-4 text-accent" />
                    <span className="text-xs font-medium uppercase">Powertrains</span>
                  </div>
                  <p className="mt-1 font-semibold text-ink">e:HEV & i-VTEC</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Fuel className="size-4 text-good" />
                    <span className="text-xs font-medium uppercase">ARAI Mileage</span>
                  </div>
                  <p className="mt-1 font-semibold text-ink">Up to 27.26 km/l</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Gauge className="size-4 text-accent" />
                    <span className="text-xs font-medium uppercase">Max Power</span>
                  </div>
                  <p className="mt-1 font-semibold text-ink">126 PS Combined</p>
                </div>
                <div className="rounded-xl border border-line p-3">
                  <div className="flex items-center gap-2 text-muted">
                    <Settings2 className="size-4 text-accent" />
                    <span className="text-xs font-medium uppercase">Transmission</span>
                  </div>
                  <p className="mt-1 font-semibold text-ink">6-MT, CVT, e-CVT</p>
                </div>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="mt-8 space-y-3 pt-6 border-t border-line">
              <div className="flex flex-wrap gap-3">
                <LeadCapture
                  vehicleId={vehicle.id}
                  vehicleName={vehicle.name}
                  launchStatus={vehicle.launchStatus}
                  cities={cities}
                />
                <AddToCompare vehicle={vehicle} />
              </div>

              {/* Brochure Download Link */}
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-paper"
              >
                <Download className="size-4 text-accent" />
                Download Official Brochure (PDF, 22MB)
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Multi-Tab Navigation Bar */}
      <nav
        aria-label="Vehicle Details Sections"
        className="sticky top-2 z-20 flex overflow-x-auto rounded-2xl border border-line bg-card/95 p-1.5 shadow-md backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "overview"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink"
          )}
        >
          <Sparkles className="size-4" />
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "specs"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink"
          )}
        >
          <Gauge className="size-4" />
          Technical Specs (7 Worksheets)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "features"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink"
          )}
        >
          <Layers className="size-4" />
          Feature Matrix (124 Features)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comparator")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "comparator"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink"
          )}
        >
          <SlidersHorizontal className="size-4" />
          Trim Comparator (SV to ZX+)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "pricing"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink"
          )}
        >
          <FileText className="size-4" />
          Prices & On-Road Estimator
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dealers")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            activeTab === "dealers"
              ? "bg-ink text-card"
              : "text-muted hover:text-ink"
          )}
        >
          <MapPin className="size-4" />
          Dealers & Reviews
        </button>
      </nav>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & POWERTRAINS                                  */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <section className="space-y-8">
          {/* Dual Powertrain Comparison Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* e:HEV Strong Hybrid Card */}
            <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-accent px-4 py-1.5 text-xs font-bold tracking-wider text-card uppercase">
                Strong Hybrid
              </div>
              <p className="text-xs font-bold tracking-wider text-accent uppercase">
                Electrified Powertrain
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                1.5L Atkinson Cycle e:HEV
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Two-motor self-charging hybrid electric system (SHEV) paired with
                a 172.8V Lithium-Ion battery pack. Delivers instantaneous electric
                torque and exceptional 27.26 km/l ARAI certified fuel economy.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-xs text-muted uppercase">Combined Max Power</dt>
                  <dd className="font-semibold text-ink">93 kW [126 PS]</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Motor Max Torque</dt>
                  <dd className="font-semibold text-ink">253 Nm @ 0-3,000 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Transmission</dt>
                  <dd className="font-semibold text-ink">e-CVT (Wet Multi-Plate)</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Fuel Efficiency</dt>
                  <dd className="font-semibold text-good">27.26 km/l</dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl bg-paper p-4 text-xs">
                <span className="font-semibold text-ink">Intelligent Drive Modes:</span>
                <p className="mt-1 text-muted">
                  Auto-selection across EV Drive Mode (pure electric), Hybrid
                  Drive Mode (engine powers generator, motor drives wheels), and
                  Engine Drive Mode (high-speed cruise clutch lockup).
                </p>
              </div>
            </div>

            {/* i-VTEC Petrol Card */}
            <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-ink px-4 py-1.5 text-xs font-bold tracking-wider text-card uppercase">
                Naturally Aspirated
              </div>
              <p className="text-xs font-bold tracking-wider text-muted uppercase">
                High-Revving Petrol Engine
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                1.5L i-VTEC DOHC with VTC
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Water-cooled inline 4-cylinder petrol engine engineered for crisp
                throttle response, smooth revving up to 6,600 rpm, and robust
                highway overtaking ability. E20 ethanol-compliant.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-xs text-muted uppercase">Max Engine Power</dt>
                  <dd className="font-semibold text-ink">89 kW [121 PS] @ 6,600 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Max Engine Torque</dt>
                  <dd className="font-semibold text-ink">145 Nm @ 4,300 rpm</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Transmission</dt>
                  <dd className="font-semibold text-ink">6-Speed MT / 7-Speed CVT</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted uppercase">Fuel Efficiency</dt>
                  <dd className="font-semibold text-good">17.77 (MT) / 17.97 (CVT) km/l</dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl bg-paper p-4 text-xs">
                <span className="font-semibold text-ink">Transmission Features:</span>
                <p className="mt-1 text-muted">
                  6-speed manual for engaging control, or smooth Continuous Variable
                  Transmission (CVT) equipped with 7-speed steering paddle shifters
                  and remote engine start.
                </p>
              </div>
            </div>
          </div>

          {/* Key Dimensions & Chassis Overview */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <h3 className="font-display text-2xl text-ink">Dimensions & Chassis Metrics</h3>
            <p className="mt-1 text-sm text-muted">
              Class-leading executive sedan cabin proportions and luggage versatility.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-line bg-paper p-4 text-center">
                <p className="text-xs text-muted uppercase">Overall Length</p>
                <p className="mt-1 text-lg font-bold text-ink">4,594 mm</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4 text-center">
                <p className="text-xs text-muted uppercase">Overall Width</p>
                <p className="mt-1 text-lg font-bold text-ink">1,748 mm</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4 text-center">
                <p className="text-xs text-muted uppercase">Overall Height</p>
                <p className="mt-1 text-lg font-bold text-ink">1,489 mm</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4 text-center">
                <p className="text-xs text-muted uppercase">Wheelbase</p>
                <p className="mt-1 text-lg font-bold text-ink">2,600 mm</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4 text-center">
                <p className="text-xs text-muted uppercase">Turning Radius</p>
                <p className="mt-1 text-lg font-bold text-ink">5.3 m</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4 text-center">
                <p className="text-xs text-muted uppercase">Fuel Tank</p>
                <p className="mt-1 text-lg font-bold text-ink">40 Litres</p>
              </div>
            </div>
          </div>

          {/* Quick Trims Grid */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-ink">Available Variants & Trims</h3>
                <p className="mt-1 text-sm text-muted">
                  From value-packed SV to ultra-premium e:HEV ZX+ Strong Hybrid.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("comparator")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
              >
                Compare Trim Features <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicle.variants.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-paper p-5 transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-accent">
                        {v.transmission}
                      </span>
                      <span className="text-xs font-medium text-muted">
                        {v.powertrain || "i-VTEC"}
                      </span>
                    </div>
                    <h4 className="mt-3 font-display text-xl text-ink">{v.name}</h4>
                    <p className="mt-1 font-display text-2xl text-ink">
                      {formatInr(v.exShowroomPrice)}
                    </p>
                    <p className="text-xs text-muted">
                      Est. On-Road Delhi: {formatInr(v.onRoadPriceEst)}
                    </p>
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-line/60 pt-3 text-xs text-muted">
                    {v.keyFeatures.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-good" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TECHNICAL SPECIFICATIONS (Engine.xlsx)                  */}
      {/* ============================================================== */}
      {activeTab === "specs" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Engine & Technical Specifications
              </h2>
              <p className="mt-1 text-sm text-muted">
                7 structured worksheets extracted directly from Engine.xlsx comparing
                e:HEV Strong Hybrid vs i-VTEC Petrol.
              </p>
            </div>

            {/* Parameter Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search parameter..."
                value={specSearch}
                onChange={(e) => setSpecSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Spec Categories">
            {["All", ...engineSpecs.map((cat) => cat.category)].map((catName) => (
              <button
                key={catName}
                type="button"
                onClick={() => setActiveSpecCategory(catName)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  activeSpecCategory === catName
                    ? "bg-ink text-card"
                    : "border border-line bg-card text-muted hover:border-ink/40 hover:text-ink"
                )}
              >
                {catName}
              </button>
            ))}
          </div>

          {/* Tables per Category */}
          <div className="space-y-6">
            {filteredSpecs.map((category) => (
              <div
                key={category.category}
                className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm"
              >
                <div className="border-b border-line bg-paper/60 px-6 py-4">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {category.category}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-paper/30 text-xs font-semibold uppercase text-muted">
                        <th className="w-2/5 px-6 py-3.5">Parameter</th>
                        <th className="w-[30%] px-6 py-3.5 text-accent">
                          e:HEV (Strong Hybrid)
                        </th>
                        <th className="w-[30%] px-6 py-3.5 text-ink">
                          i-VTEC (Petrol)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {category.specs.map((spec, sIdx) => (
                        <tr
                          key={sIdx}
                          className="transition-colors hover:bg-paper/40"
                        >
                          <td className="px-6 py-3.5 font-medium text-ink">
                            {spec.parameter}
                          </td>
                          <td className="whitespace-pre-line px-6 py-3.5 text-ink/90">
                            {spec.eHev === "—" ? (
                              <span className="text-muted">—</span>
                            ) : (
                              <span className="font-semibold text-accent">
                                {spec.eHev}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-pre-line px-6 py-3.5 text-ink/90">
                            {spec.iVtec === "—" ? (
                              <span className="text-muted">—</span>
                            ) : (
                              spec.iVtec
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {filteredSpecs.length === 0 && (
              <div className="rounded-3xl border border-line bg-card p-12 text-center">
                <HelpCircle className="mx-auto size-8 text-muted" />
                <p className="mt-2 text-base font-semibold text-ink">
                  No technical parameters match your search.
                </p>
                <p className="text-xs text-muted">Try clearing the search query.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FEATURE MATRIX (Features.xlsx)                          */}
      {/* ============================================================== */}
      {activeTab === "features" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Equipment & Feature Matrix
              </h2>
              <p className="mt-1 text-sm text-muted">
                All 4 feature sheets (124 line items) from Features.xlsx across trims
                SV, V, VX, ZX, and ZX+.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Differences Only Toggle */}
              <button
                type="button"
                onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                  showDifferencesOnly
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-card text-muted hover:text-ink"
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                {showDifferencesOnly
                  ? "Showing Differences Only"
                  : "Show Differences Only"}
              </button>

              {/* Feature Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search features (e.g. ADAS)..."
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Feature Categories">
            {["All", ...featureMatrix.map((cat) => cat.category)].map((catName) => (
              <button
                key={catName}
                type="button"
                onClick={() => setActiveFeatureCategory(catName)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  activeFeatureCategory === catName
                    ? "bg-ink text-card"
                    : "border border-line bg-card text-muted hover:border-ink/40 hover:text-ink"
                )}
              >
                {catName}
              </button>
            ))}
          </div>

          {/* Feature Matrix Tables */}
          <div className="space-y-6">
            {filteredFeatures.map((cat) => (
              <div
                key={cat.category}
                className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm"
              >
                <div className="border-b border-line bg-paper/60 px-6 py-4">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {cat.category}
                    <span className="ml-2 text-xs font-normal text-muted">
                      ({cat.features.length} features)
                    </span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-paper/30 text-xs font-semibold uppercase text-muted">
                        <th className="min-w-[280px] px-6 py-3.5">Feature</th>
                        {trimList.map((t) => (
                          <th
                            key={t}
                            className={cn(
                              "w-28 px-4 py-3.5 text-center",
                              t === "ZX+" ? "bg-accent-soft/30 text-accent font-bold" : ""
                            )}
                          >
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {cat.features.map((item, fIdx) => (
                        <tr
                          key={fIdx}
                          className="transition-colors hover:bg-paper/40"
                        >
                          <td className="px-6 py-3.5 font-medium text-ink">
                            {item.feature}
                          </td>
                          {trimList.map((t) => {
                            const val = item.trims[t] || "—";
                            return (
                              <td
                                key={t}
                                className={cn(
                                  "px-4 py-3.5 text-center text-xs",
                                  t === "ZX+" ? "bg-accent-soft/10" : ""
                                )}
                              >
                                {val === "Y" ? (
                                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-good-soft text-good">
                                    <Check className="size-3.5 stroke-[3]" />
                                  </span>
                                ) : val === "—" ? (
                                  <span className="text-muted/60">—</span>
                                ) : (
                                  <span className="inline-block rounded-md bg-paper px-2 py-1 font-medium text-ink">
                                    {val}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {filteredFeatures.length === 0 && (
              <div className="rounded-3xl border border-line bg-card p-12 text-center">
                <HelpCircle className="mx-auto size-8 text-muted" />
                <p className="mt-2 text-base font-semibold text-ink">
                  No features match your current filter.
                </p>
                <p className="text-xs text-muted">
                  Try turning off &quot;Differences Only&quot; or clearing your search.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 4: TRIM COMPARATOR (SV to ZX+)                             */}
      {/* ============================================================== */}
      {activeTab === "comparator" && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Trim-to-Trim Comparison Tool
            </h2>
            <p className="mt-1 text-sm text-muted">
              Select any two trims to immediately discover which upgrades and
              safety technologies you unlock.
            </p>

            {/* Selectors */}
            <div className="mt-6 grid gap-4 rounded-2xl bg-paper p-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-muted">
                  Base Trim / Reference
                </label>
                <select
                  value={trimA}
                  onChange={(e) => setTrimA(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-card px-4 text-base font-semibold text-ink outline-none focus:border-accent"
                >
                  {trimList.map((t) => (
                    <option key={t} value={t}>
                      Honda City {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-accent">
                  Compare With / Target Upgrade
                </label>
                <select
                  value={trimB}
                  onChange={(e) => setTrimB(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-card px-4 text-base font-semibold text-accent outline-none focus:border-accent"
                >
                  {trimList.map((t) => (
                    <option key={t} value={t}>
                      Honda City {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Overview Banner */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-accent-soft/30 p-5">
              <div>
                <span className="text-xs font-bold tracking-wider text-accent uppercase">
                  Trim Upgrade Advantage
                </span>
                <h3 className="font-display text-2xl text-ink">
                  Upgrading from {trimA} to {trimB}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Unlocks {trimComparisonData.upgradedInB.length} exclusive features
                  and comfort upgrades.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted uppercase">Added Features</p>
                  <p className="text-2xl font-bold text-good">
                    +{trimComparisonData.upgradedInB.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted uppercase">Shared Equipment</p>
                  <p className="text-2xl font-bold text-ink">
                    {trimComparisonData.bothHave.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Features Added in Trim B */}
            <div className="mt-8">
              <h4 className="flex items-center gap-2 font-display text-xl text-ink">
                <CheckCircle2 className="size-5 text-good" />
                Features Gained in {trimB} (Missing in {trimA})
              </h4>
              <p className="mt-0.5 text-xs text-muted">
                These features are standard in {trimB} but not available on {trimA}.
              </p>

              {trimComparisonData.upgradedInB.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {trimComparisonData.upgradedInB.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between rounded-xl border border-line bg-card p-3.5 shadow-xs"
                    >
                      <div className="pr-3">
                        <span className="text-[10px] font-semibold text-accent uppercase">
                          {item.category}
                        </span>
                        <p className="text-sm font-medium text-ink">{item.feature}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-good-soft px-2 py-0.5 text-xs font-semibold text-good">
                        {item.valB === "Y" ? "Included" : item.valB}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  No additional features gained in this direction.
                </p>
              )}
            </div>

            {/* Common Equipment */}
            <div className="mt-8 border-t border-line pt-6">
              <h4 className="font-display text-lg text-ink">
                Common Standard Equipment ({trimComparisonData.bothHave.length} Features)
              </h4>
              <p className="mt-0.5 text-xs text-muted">
                Features available on both {trimA} and {trimB}.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {trimComparisonData.bothHave.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink"
                  >
                    <Check className="size-3 text-good" />
                    {item.feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PRICING & ON-ROAD ESTIMATOR (Price-Ex-ShowRoom.txt)    */}
      {/* ============================================================== */}
      {activeTab === "pricing" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Variant Lineup & Delhi Pricing Breakdown
              </h2>
              <p className="mt-1 text-sm text-muted">
                Ex-showroom Delhi prices verified against Price-Ex-ShowRoom.txt with
                transparent estimated on-road charges.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper/60 text-xs font-semibold uppercase text-muted">
                    <th className="px-6 py-4">Variant & Powertrain</th>
                    <th className="px-4 py-4">Transmission</th>
                    <th className="px-4 py-4 text-right">Ex-Showroom (Delhi)</th>
                    <th className="px-4 py-4 text-right">Est. RTO (10%)</th>
                    <th className="px-4 py-4 text-right">Insurance (~3.5%)</th>
                    <th className="px-6 py-4 text-right">Est. On-Road Delhi</th>
                    <th className="px-6 py-4 text-center">Inquiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {vehicle.variants.map((v) => {
                    const exPrice = v.exShowroomPrice;
                    const rto = Math.round(exPrice * 0.1);
                    const ins = Math.round(exPrice * 0.035);
                    const onRoad = v.onRoadPriceEst || exPrice + rto + ins + 2000;
                    const isHybrid = v.powertrain?.includes("Hybrid");

                    return (
                      <tr
                        key={v.id}
                        className={cn(
                          "transition-colors hover:bg-paper/40",
                          isHybrid && "bg-accent-soft/10"
                        )}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-ink">{v.name}</p>
                          <p className="text-xs text-muted">
                            {v.powertrain || "i-VTEC Petrol"} · {v.seatingCapacity ?? 5} Seats
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-paper px-2 py-1 text-xs font-medium text-ink">
                            {v.transmission}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-ink">
                          {formatInr(exPrice)}
                        </td>
                        <td className="px-4 py-4 text-right text-xs text-muted">
                          {formatInr(rto)}
                        </td>
                        <td className="px-4 py-4 text-right text-xs text-muted">
                          {formatInr(ins)}
                        </td>
                        <td className="px-6 py-4 text-right font-display text-base font-bold text-accent">
                          {formatInr(onRoad)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <LeadCapture
                            vehicleId={vehicle.id}
                            vehicleName={vehicle.name}
                            launchStatus={vehicle.launchStatus}
                            variantId={v.id}
                            variantName={v.name}
                            cities={cities}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-line bg-paper/40 p-4 text-xs text-muted">
              * Note: On-road prices are computed estimates for Delhi registration
              including road tax, 1-year OD + 3-year TP insurance, FASTag, and MCD
              cess. Final prices may vary with dealer discounts and optional accessory
              packs.
            </div>
          </div>

          {/* Pricing & Variant Trim Cards with Preceding Trim Upgrade Differences */}
          <div className="mt-10 space-y-4">
            <div>
              <h3 className="font-display text-2xl text-ink">
                Variant Trim Cards & Equipment Progression
              </h3>
              <p className="mt-1 text-sm text-muted">
                Each trim tier builds upon the last. Click &quot;Highlight differences over preceding trim&quot; to inspect the exact additions gained.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {vehicle.variants.map((v) => {
                const diff = getPrecedingTrimDifferences(v.name);
                const isExpanded = expandedDiffVariant === v.id;
                const isHybrid = v.powertrain?.includes("Hybrid");

                return (
                  <div
                    key={v.id}
                    className={cn(
                      "flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md",
                      isHybrid ? "border-accent/40 bg-accent-soft/10" : "border-line"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-bold",
                            isHybrid ? "bg-accent text-card" : "bg-paper text-ink"
                          )}
                        >
                          {v.powertrain || "i-VTEC"}
                        </span>
                        <span className="rounded-md border border-line bg-card px-2 py-0.5 text-xs font-semibold text-muted">
                          {v.transmission}
                        </span>
                      </div>

                      <h4 className="mt-3 font-display text-xl text-ink">{v.name}</h4>
                      <div className="mt-2">
                        <p className="font-display text-2xl font-bold text-accent">
                          {formatInr(v.exShowroomPrice)}
                        </p>
                        <p className="text-xs text-muted">
                          Est. On-Road Delhi: {formatInr(v.onRoadPriceEst || Math.round(1.14 * v.exShowroomPrice))}
                        </p>
                      </div>

                      {/* Key Features Pill list */}
                      <ul className="mt-4 space-y-1.5 text-xs text-muted">
                        {v.keyFeatures.slice(0, 3).map((kf, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-good" />
                            <span>{kf}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Interactive Differences Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedDiffVariant(isExpanded ? null : v.id)}
                        className="mt-5 flex w-full items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        <span>Highlight differences over {diff.preceding}</span>
                        <ChevronRight
                          className={cn(
                            "size-3.5 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </button>

                      {/* Expanded Diff Accordion */}
                      {isExpanded && (
                        <div className="mt-3 rounded-2xl border border-good/20 bg-good-soft/30 p-3.5 text-xs">
                          <p className="font-bold text-good">
                            Added over {diff.preceding}:
                          </p>
                          <ul className="mt-2 space-y-1 text-ink/90">
                            {diff.additions.map((add, aIdx) => (
                              <li key={aIdx} className="flex items-start gap-1.5">
                                <span className="font-bold text-good">+</span>
                                <span>{add}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-line/60 pt-4">
                      <LeadCapture
                        vehicleId={vehicle.id}
                        vehicleName={vehicle.name}
                        launchStatus={vehicle.launchStatus}
                        variantId={v.id}
                        variantName={v.name}
                        cities={cities}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 6: DEALERS & REVIEWS                                       */}
      {/* ============================================================== */}
      {activeTab === "dealers" && (
        <section className="space-y-12">
          {/* Enhanced Multi-Outlet Dealer Locator */}
          <VehicleDealerLocator
            dealers={vehicle.dealers ?? []}
            brandName={vehicle.brandName}
            brandSlug={vehicle.brandSlug}
            vehicleName={vehicle.name}
          />

          {/* Verified Owner Reviews */}
          <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-4">
              <div>
                <h3 className="font-display text-2xl text-ink">Owner Experiences &amp; Reviews</h3>
                <p className="mt-1 text-sm text-muted">
                  Authentic ratings and feedback from verified {vehicle.name} drivers.
                </p>
              </div>
              <span className="rounded-full bg-good-soft px-3 py-1 text-xs font-bold text-good">
                100% Verified Community Feedback
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicle.reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-paper p-5 border border-line/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-3.5",
                              star <= r.ratingOverall
                                ? "fill-accent text-accent"
                                : "text-line"
                            )}
                          />
                        ))}
                      </div>
                      {r.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-good">
                          <ShieldCheck className="size-3.5" /> Verified Owner
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-bold text-ink">{r.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{r.comment}</p>
                  </div>
                  <p className="mt-4 pt-3 border-t border-line/40 text-[11px] font-medium text-muted">
                    {r.authorName} ({r.city})
                    {r.ratingMileage && ` · Mileage: ${r.ratingMileage}/5`}
                    {r.ratingComfort && ` · Comfort: ${r.ratingComfort}/5`}
                  </p>
                </div>
              ))}

              {vehicle.reviews.length === 0 && (
                <p className="p-8 text-center text-sm text-muted sm:col-span-2 lg:col-span-3">
                  No owner reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
