"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CircleDollarSign,
  ExternalLink,
  Flame,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { CatalogVehicle } from "@/lib/requirements";
import { cn, formatInr } from "@/lib/utils";

interface HeadToHeadCompareProps {
  vehicle1: CatalogVehicle;
  vehicle2: CatalogVehicle;
  vehicle3?: CatalogVehicle;
}

export function HeadToHeadCompare({ vehicle1, vehicle2, vehicle3 }: HeadToHeadCompareProps) {
  const activeVehicles = [vehicle1, vehicle2, ...(vehicle3 ? [vehicle3] : [])];
  const isTriple = Boolean(vehicle3);

  // Helper to pick a smart default variant
  const getDefaultTrimId = (v: CatalogVehicle) => {
    // Slavia: Monte Carlo DSG or 1.5 DSG
    const mcDsg = v.variants.find((x) => x.name.includes("Monte Carlo") && x.name.includes("DSG"));
    if (mcDsg) return mcDsg.id;
    const dsg = v.variants.find((x) => x.name.includes("DSG"));
    if (dsg) return dsg.id;

    // Verna: Turbo DCT or top variant
    const vernaTurbo = v.variants.find((x) => x.name.includes("Turbo") && x.name.includes("DCT"));
    if (vernaTurbo) return vernaTurbo.id;

    // City: e:HEV Hybrid or ZX CVT
    const eHev = v.variants.find((x) => x.name.includes("e:HEV"));
    if (eHev) return eHev.id;
    const zx = v.variants.find((x) => x.name.includes("ZX"));
    if (zx) return zx.id;

    return v.variants[v.variants.length - 1]?.id || v.variants[0]?.id || "";
  };

  // Selected Trims for variant-level comparison
  const [selectedTrimId1, setSelectedTrimId1] = useState<string>(() => getDefaultTrimId(vehicle1));
  const [selectedTrimId2, setSelectedTrimId2] = useState<string>(() => getDefaultTrimId(vehicle2));
  const [selectedTrimId3, setSelectedTrimId3] = useState<string>(() =>
    vehicle3 ? getDefaultTrimId(vehicle3) : ""
  );

  const trim1 = vehicle1.variants.find((v) => v.id === selectedTrimId1) || vehicle1.variants[0];
  const trim2 = vehicle2.variants.find((v) => v.id === selectedTrimId2) || vehicle2.variants[0];
  const trim3 = vehicle3
    ? vehicle3.variants.find((v) => v.id === selectedTrimId3) || vehicle3.variants[0]
    : null;

  // Active Category Filter for Comparison
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");

  // EMI calculation (8.5% p.a., 60 months, 85% loan)
  const calcEmi = (price: number) => {
    const p = price * 0.85;
    const r = 8.5 / 12 / 100;
    const n = 60;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const emi1 = calcEmi(trim1?.onRoadPriceEst || 0);
  const emi2 = calcEmi(trim2?.onRoadPriceEst || 0);
  const emi3 = trim3 ? calcEmi(trim3?.onRoadPriceEst || 0) : 0;

  // Helper to extract NCAP text
  const getNcapBadge = (v: CatalogVehicle) => {
    if (v.slug.includes("slavia")) return "5-Star Global NCAP (Adult & Child)";
    if (v.slug.includes("verna")) return "5-Star Global NCAP";
    if (v.slug.includes("city")) return "5-Star ASEAN NCAP";
    return v.ncapRating ? `${v.ncapRating}-Star NCAP` : "High-Strength Structure";
  };

  // Static spec registry for the 3 sedans
  const getCarSpec = (v: CatalogVehicle, key: string): string => {
    const slug = v.slug;
    if (slug.includes("slavia")) {
      switch (key) {
        case "naEngine":
          return "1.0L TSI Turbo Petrol (115 PS @ 5000-5500 rpm / 178 Nm @ 1750-4500 rpm)";
        case "turboEngine":
          return "1.5L TSI EVO with ACT (150 PS @ 5000-6000 rpm / 250 Nm @ 1600-3500 rpm)";
        case "hybrid":
          return "— (Not offered)";
        case "gearbox":
          return "6-Speed Manual / 6-Speed AT / 7-Speed DSG Dual Clutch";
        case "boot":
          return "521 Litres (Expandable to 1,050 L)";
        case "clearance":
          return "179 mm (Class-Leading unladen clearance)";
        case "dimensions":
          return "4,541 mm (L) × 1,752 mm (W) × 1,507 mm (H) | Wheelbase: 2,651 mm";
        case "mileage":
          return "20.32 kmpl (1.0 MT) · 18.73 kmpl (6-AT) · 19.36 kmpl (1.5 DSG)";
        case "sprint":
          return "~8.8 sec (1.5 TSI DSG) · ~10.7 sec (1.0 TSI MT)";
        case "safety":
          return "5-Star Global NCAP (Adult & Child), 6 Airbags Std, Multi-Collision Braking (MKB), Electronic Differential Lock (XDS/XDS+)";
        case "adas":
          return "Driver-Focused: TPMS, Rear Camera, Hill Hold Control, Auto Wipers/Lights (No ADAS camera intervention)";
        case "screens":
          return "10\" HD Touchscreen with Wireless Apple CarPlay & Android Auto + 8\" Virtual Cockpit";
        case "audio":
          return "Škoda Sound System (380W, 8 Speakers + Subwoofer in boot)";
        case "ventilatedSeats":
          return "Yes (Front Ventilated Seats on Prestige & Monte Carlo)";
        default:
          return "—";
      }
    } else if (slug.includes("verna")) {
      switch (key) {
        case "naEngine":
          return "1.5L MPi Petrol (115 PS @ 6300 rpm / 143.8 Nm @ 4500 rpm)";
        case "turboEngine":
          return "1.5L Turbo GDi (160 PS @ 5500 rpm / 253 Nm @ 1500-3500 rpm)";
        case "hybrid":
          return "— (Not offered)";
        case "gearbox":
          return "6-Speed Manual / Intelligent Variable (iVT) / 7-Speed DCT";
        case "boot":
          return "528 Litres";
        case "clearance":
          return "165 mm";
        case "dimensions":
          return "4,535 mm (L) × 1,765 mm (W) × 1,475 mm (H) | Wheelbase: 2,670 mm";
        case "mileage":
          return "18.60 kmpl (MPi MT) · 20.00 kmpl (Turbo DCT)";
        case "sprint":
          return "~8.1 sec (Turbo DCT) · ~10.8 sec (MPi)";
        case "safety":
          return "5-Star Global NCAP, 6 Airbags Std, All 4 Disc Brakes (Turbo), VSM & ESC";
        case "adas":
          return "Hyundai SmartSense Level 2 ADAS (17 active safety radar/camera features with Stop & Go, 360 Camera)";
        case "screens":
          return "Integrated Dual 10.25\" Digital Cluster & HD Navigation Displays";
        case "audio":
          return "Bose Premium 8-Speaker Sound System";
        case "ventilatedSeats":
          return "Yes (Front Ventilated & Heated Seats + Powered Driver Seat)";
        default:
          return "—";
      }
    } else if (slug.includes("city")) {
      switch (key) {
        case "naEngine":
          return "1.5L i-VTEC DOHC (121 PS @ 6600 rpm / 145 Nm @ 4300 rpm)";
        case "turboEngine":
          return "— (Not offered in Honda City lineup)";
        case "hybrid":
          return "1.5L Atkinson Cycle e:HEV Strong Hybrid (126 PS / 253 Nm instant motor torque, 27.26 km/l ARAI)";
        case "gearbox":
          return "6-Speed Manual / 7-Step CVT / e-CVT Electric Direct Drive";
        case "boot":
          return "506 Litres (Petrol) · 306 Litres (e:HEV Hybrid)";
        case "clearance":
          return "165 mm";
        case "dimensions":
          return "4,583 mm (L) × 1,748 mm (W) × 1,489 mm (H) | Wheelbase: 2,600 mm";
        case "mileage":
          return "17.80 kmpl (Petrol MT) · 18.40 kmpl (CVT) · 27.26 kmpl (e:HEV Hybrid)";
        case "sprint":
          return "~9.5 sec (e:HEV) · ~10.2 sec (i-VTEC MT)";
        case "safety":
          return "5-Star ASEAN NCAP, ACE Body Structure, 6 Airbags Std, LaneWatch™ Camera, All 4 Discs (e:HEV)";
        case "adas":
          return "Honda SENSING ADAS Suite (Collision Mitigation, Lane Keep, Road Departure, Adaptive Cruise with LSF)";
        case "screens":
          return "8\" Advanced Touchscreen Display Audio + 7\" Full-Colour TFT MID Cluster";
        case "audio":
          return "8-Speaker Premium Surround Sound System";
        case "ventilatedSeats":
          return "No (Fabric or Perforated Leatherette Upholstery)";
        default:
          return "—";
      }
    }
    return "—";
  };

  return (
    <div className="space-y-12">
      {/* ============================================================== */}
      {/* 1. HEADER & VEHICLE HERO CARDS OVERVIEW                         */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-card via-paper/40 to-paper/80 p-6 shadow-xs sm:p-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1 text-xs font-bold text-accent uppercase tracking-wider">
            <Sparkles className="size-3.5" /> Direct Midsize Sedan Shootout
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-5xl">
            {activeVehicles.map((v) => v.name).join(" vs. ")}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
            The definitive Indian C-Segment sedan benchmark. Comparing European chassis dynamics & 179 mm clearance (Slavia), 160 PS turbo speed & Level-2 ADAS (Verna), and 27.26 km/l hybrid efficiency & legendary comfort (City).
          </p>
        </div>

        {/* Dual or Triple Vehicle Cards Grid */}
        <div
          className={cn(
            "mt-10 grid gap-6",
            isTriple ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
          )}
        >
          {activeVehicles.map((v, idx) => {
            const selectedTrimId =
              idx === 0 ? selectedTrimId1 : idx === 1 ? selectedTrimId2 : selectedTrimId3;
            const setSelectedTrimId =
              idx === 0
                ? setSelectedTrimId1
                : idx === 1
                ? setSelectedTrimId2
                : setSelectedTrimId3;
            const activeTrim = idx === 0 ? trim1 : idx === 1 ? trim2 : trim3;
            const emi = idx === 0 ? emi1 : idx === 1 ? emi2 : emi3;

            return (
              <div
                key={v.id}
                className="flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                      {v.brandName}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-good-soft px-2.5 py-0.5 text-[11px] font-semibold text-good">
                      <ShieldCheck className="size-3.5" /> {getNcapBadge(v)}
                    </span>
                  </div>

                  {/* Car Hero Image Container */}
                  <div className="relative mt-4 aspect-[16/10] min-h-[220px] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8f6f0] via-[#ece7dc] to-[#e4ded4] p-4 flex items-center justify-center border border-line/40 shadow-inner">
                    <Image
                      src={v.heroImage}
                      alt={v.name}
                      fill
                      priority
                      className="object-contain drop-shadow-2xl transition-all duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="mt-4">
                    <h2 className="font-display text-2xl font-bold text-ink">{v.name}</h2>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{v.tagline || "C-Segment Sedan"}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-extrabold text-ink">
                        {formatInr(v.priceMin)} – {formatInr(v.priceMax)}
                      </span>
                      <span className="text-[11px] text-muted">(Ex-Showroom)</span>
                    </div>
                  </div>

                  {/* Trim Selector */}
                  <div className="mt-5 rounded-2xl border border-line bg-paper/60 p-4">
                    <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
                      Select {v.name} Variant:
                    </label>
                    <select
                      value={selectedTrimId}
                      onChange={(e) => setSelectedTrimId(e.target.value)}
                      className="w-full rounded-xl border border-line bg-card py-2.5 px-3 text-xs font-semibold text-ink focus:border-accent focus:outline-hidden"
                    >
                      {v.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name} ({formatInr(variant.exShowroomPrice)})
                        </option>
                      ))}
                    </select>

                    {activeTrim && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-line/50 pt-2.5">
                        <div>
                          <span className="text-muted block text-[10px]">Est. On-Road Delhi:</span>
                          <span className="font-bold text-good">
                            {formatInr(activeTrim.onRoadPriceEst)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted block text-[10px]">Est. Monthly EMI (5yr):</span>
                          <span className="font-bold text-ink">{formatInr(emi)}/mo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-line pt-4 flex items-center justify-between">
                  <Link
                    href={`/cars/${v.brandSlug || "cars"}/${v.slug}`}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    View Specs & Colors <ExternalLink className="size-3" />
                  </Link>
                  <span className="text-xs text-muted">{v.variants.length} Variants</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Variant Difference Summary */}
        {!isTriple && trim1 && trim2 && (
          <div className="mt-6 rounded-2xl border border-accent/20 bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accent-soft p-2.5 text-accent">
                <CircleDollarSign className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-semibold">Live Selected Trim Differential</p>
                <p className="text-sm font-bold text-ink">
                  {trim1.exShowroomPrice < trim2.exShowroomPrice ? (
                    <span>
                      {trim1.name} is{" "}
                      <span className="text-good">
                        {formatInr(Math.abs(trim1.exShowroomPrice - trim2.exShowroomPrice))} more affordable
                      </span>{" "}
                      (Ex-Showroom) than {trim2.name}
                    </span>
                  ) : (
                    <span>
                      {trim1.name} commands a premium of{" "}
                      <span className="text-accent">
                        {formatInr(Math.abs(trim1.exShowroomPrice - trim2.exShowroomPrice))}
                      </span>{" "}
                      over {trim2.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-muted">On-Road Delta: </span>
              <span className="font-bold text-ink">
                {formatInr(Math.abs(trim1.onRoadPriceEst - trim2.onRoadPriceEst))}
              </span>
              <span className="text-muted block text-[11px]">
                EMI delta: ~{formatInr(Math.abs(emi1 - emi2))}/mo
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 2. BROAD COMPARISON CATEGORY NAVIGATION                       */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Complete Comparison" },
          { id: "powertrain", label: "Powertrains & Performance" },
          { id: "dimensions", label: "Dimensions & Boot Space" },
          { id: "safety", label: "Safety & Chassis Dynamics" },
          { id: "tech", label: "ADAS & Cockpit Tech" },
          { id: "pricing", label: "Variant Price Ladders" },
          { id: "verdict", label: "Expert Buyer Verdict" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategoryTab(tab.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
              activeCategoryTab === tab.id
                ? "bg-ink text-card"
                : "border border-line bg-card text-muted hover:text-ink hover:bg-paper"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 3. POWERTRAIN & PERFORMANCE SHOOTOUT                          */}
      {/* ============================================================== */}
      {(activeCategoryTab === "all" || activeCategoryTab === "powertrain") && (
        <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Flame className="size-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Engine & Transmission Matrix
                </span>
              </div>
              <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">
                Powertrain & Performance Shootout
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted bg-paper px-3 py-1 rounded-full border border-line">
              150 PS TSI vs 160 PS GDi vs 126 PS Hybrid
            </span>
          </div>

          {/* Three Key Pillar Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Slavia Highlight */}
            <div className="rounded-2xl border border-line bg-paper/50 p-5 space-y-2">
              <span className="rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Škoda Slavia TSI EVO
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                1.5L TSI EVO (150 PS / 250 Nm) + ACT
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Active Cylinder Technology shuts down two cylinders under coasting for maximum efficiency. Paired with a lightning-fast 7-speed DSG with paddle shifters.
              </p>
            </div>

            {/* Verna Highlight */}
            <div className="rounded-2xl border border-accent/40 bg-accent-soft/10 p-5 space-y-2">
              <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Hyundai Verna Turbo GDi
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                1.5L Turbo GDi (160 PS / 253 Nm) + 7-DCT
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Most powerful engine in the segment, accelerating from 0-100 km/h in ~8.1 seconds with twin exhaust tips and launch control capability.
              </p>
            </div>

            {/* City Highlight */}
            <div className="rounded-2xl border border-good/40 bg-good-soft/10 p-5 space-y-2">
              <span className="rounded-md bg-good px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Honda City e:HEV Hybrid
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                1.5L Atkinson Cycle (27.26 km/l ARAI)
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Self-charging two-motor strong hybrid system with 253 Nm of instantaneous electric motor torque from 0 rpm and 1,000+ km full-tank range.
              </p>
            </div>
          </div>

          {/* Dynamic Table */}
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-paper text-xs uppercase text-muted">
                <tr>
                  <th className="p-4 font-semibold text-ink w-1/4">Powertrain Parameter</th>
                  {activeVehicles.map((v) => (
                    <th key={v.id} className="p-4 font-bold text-ink">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Entry / Naturally Aspirated / 1.0L Turbo</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {getCarSpec(v, "naEngine")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Turbocharged Performance Flagship</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-bold text-accent text-xs sm:text-sm">
                      {getCarSpec(v, "turboEngine")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Strong Hybrid Electrified Option</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-semibold text-good text-xs sm:text-sm">
                      {getCarSpec(v, "hybrid")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Gearbox Selections</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {getCarSpec(v, "gearbox")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Claimed ARAI Mileage</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-bold text-ink text-xs sm:text-sm">
                      {getCarSpec(v, "mileage")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">0–100 km/h Sprint Time (Approx)</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {getCarSpec(v, "sprint")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 4. DIMENSIONS, GROUND CLEARANCE & BOOT SPACE                   */}
      {/* ============================================================== */}
      {(activeCategoryTab === "all" || activeCategoryTab === "dimensions") && (
        <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-10 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Maximize2 className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Road Presence & Utility
              </span>
            </div>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Dimensions, Ground Clearance & Boot Capacity
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-accent/40 bg-accent-soft/10 p-5 space-y-2">
              <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Class-Leading Ground Clearance
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                Škoda Slavia: 179 mm Unladen Clearance
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Slavia rides with 179 mm of unladen ground clearance — matching compact SUVs and significantly out-clearing City and Verna (165 mm each) to tackle severe speed breakers and monsoonal roads without underbelly scraping.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper/50 p-5 space-y-2">
              <span className="rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Boot Space & Practicality
              </span>
              <h3 className="font-display text-lg font-bold text-ink">
                Slavia (521 L) vs Verna (528 L) vs City (506 L / 306 L)
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Slavia offers a cavernous 521-litre luggage compartment with 60:40 split-folding rear seats expanding to 1,050 litres. In comparison, City Hybrid drops to 306 litres due to its high-voltage battery.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-paper text-xs uppercase text-muted">
                <tr>
                  <th className="p-4 font-semibold text-ink w-1/4">Dimension / Utility Metric</th>
                  {activeVehicles.map((v) => (
                    <th key={v.id} className="p-4 font-bold text-ink">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Boot Space Capacity</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-bold text-good text-xs sm:text-sm">
                      {getCarSpec(v, "boot")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Ground Clearance (Unladen)</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-bold text-accent text-xs sm:text-sm">
                      {getCarSpec(v, "clearance")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Overall Length × Width × Height</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {getCarSpec(v, "dimensions")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Wheelbase</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {v.slug.includes("verna")
                        ? "2,670 mm (Longest in segment)"
                        : v.slug.includes("slavia")
                        ? "2,651 mm"
                        : "2,600 mm"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 5. SAFETY & CHASSIS DYNAMICS                                   */}
      {/* ============================================================== */}
      {(activeCategoryTab === "all" || activeCategoryTab === "safety") && (
        <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-10 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Structural Integrity & Active Safety
              </span>
            </div>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Crash Safety Ratings & Chassis Dynamics
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-paper text-xs uppercase text-muted">
                <tr>
                  <th className="p-4 font-semibold text-ink w-1/4">Safety Feature / Rating</th>
                  {activeVehicles.map((v) => (
                    <th key={v.id} className="p-4 font-bold text-ink">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Crash Test Certification</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-bold text-good text-xs sm:text-sm">
                      {getCarSpec(v, "safety")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Standard Airbags</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm font-semibold">
                      6 Airbags Standard across all variants (Dual Front, Side & Curtain)
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Electronic Differential Lock & Handling</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {v.slug.includes("slavia")
                        ? "EDS + XDS/XDS+ Electronic Differential Lock (reduces understeer), MSR, BDW"
                        : v.slug.includes("city")
                        ? "Agile Handling Assist (AHA), Vehicle Stability Assist (VSA)"
                        : "Vehicle Stability Management (VSM), Hill Assist Control (HAC)"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Braking Hardware</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {v.slug.includes("slavia")
                        ? "Front Ventilated Disc / Rear Drum with Vacuum Assist & Multi-Collision Braking (MKB)"
                        : v.slug.includes("verna")
                        ? "All 4 Disc Brakes (on Turbo GDi) / Front Disc & Rear Drum (MPi)"
                        : "All 4 Disc Brakes (on e:HEV Strong Hybrid) / Front Disc & Rear Drum (Petrol)"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 6. ADAS & COCKPIT TECH                                         */}
      {/* ============================================================== */}
      {(activeCategoryTab === "all" || activeCategoryTab === "tech") && (
        <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-10 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Zap className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Infotainment, Cockpit & ADAS
              </span>
            </div>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Level-2 ADAS Suite & Cabin Entertainment
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-paper text-xs uppercase text-muted">
                <tr>
                  <th className="p-4 font-semibold text-ink w-1/4">Technology Attribute</th>
                  {activeVehicles.map((v) => (
                    <th key={v.id} className="p-4 font-bold text-ink">
                      {v.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Level 2 ADAS Capabilities</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm font-semibold">
                      {getCarSpec(v, "adas")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Screens & Digital Displays</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {getCarSpec(v, "screens")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Sound System & Subwoofer</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 font-bold text-accent text-xs sm:text-sm">
                      {getCarSpec(v, "audio")}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-paper/40">
                  <td className="p-4 font-medium text-ink">Front Ventilated Seats</td>
                  {activeVehicles.map((v) => (
                    <td key={v.id} className="p-4 text-xs sm:text-sm">
                      {getCarSpec(v, "ventilatedSeats")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 7. VARIANT-TO-PRICE PROXIMITY COMPARISON                       */}
      {/* ============================================================== */}
      {(activeCategoryTab === "all" || activeCategoryTab === "pricing") && (
        <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-10 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <CircleDollarSign className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Price-to-Value Density (₹10L – ₹18.5L)
              </span>
            </div>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Cross-Variant Price Ladders
            </h2>
            <p className="mt-1 text-xs text-muted">
              Side-by-side variant price tiers to help buyers evaluate feature-per-rupee density across manual, torque-converter, dual-clutch, and hybrid powertrains.
            </p>
          </div>

          <div className="space-y-4">
            {/* Entry Tier */}
            <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
              <span className="rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Tier 1: Entry & Value Gateway (₹10.0L – ₹13.5L)
              </span>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Škoda Slavia</p>
                  <p className="text-muted">1.0L Classic MT: <strong className="text-ink">₹9.99 Lakh</strong></p>
                  <p className="text-muted">1.0L Signature MT: <strong className="text-ink">₹13.44 Lakh</strong></p>
                  <span className="text-[10px] text-good block mt-1">✓ 6 Airbags, ESC & XDS+ Std</span>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Honda City</p>
                  <p className="text-muted">i-VTEC SV MT: <strong className="text-ink">₹12.08 Lakh</strong></p>
                  <p className="text-muted">i-VTEC V MT: <strong className="text-ink">₹12.70 Lakh</strong></p>
                  <span className="text-[10px] text-accent block mt-1">✓ 121 PS NA engine + ADAS on V</span>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Hyundai Verna</p>
                  <p className="text-muted">1.5L MPi HX 2 MT: <strong className="text-ink">₹10.99 Lakh</strong></p>
                  <p className="text-muted">1.5L MPi HX 6 MT: <strong className="text-ink">₹12.99 Lakh</strong></p>
                  <span className="text-[10px] text-good block mt-1">✓ Aggressive fastback design</span>
                </div>
              </div>
            </div>

            {/* Mid Tier */}
            <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
              <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Tier 2: Mid & Automatic Sweet Spot (₹13.5L – ₹16.0L)
              </span>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Škoda Slavia</p>
                  <p className="text-muted">1.0L Sportline MT: <strong className="text-ink">₹13.74 Lakh</strong></p>
                  <p className="text-muted">1.0L Signature AT: <strong className="text-ink">₹14.44 Lakh</strong></p>
                  <p className="text-muted">1.0L Monte Carlo MT: <strong className="text-ink">₹15.00 Lakh</strong></p>
                  <span className="text-[10px] text-accent block mt-1">✓ Sunroof, 10&quot; Screen, Virtual Cockpit</span>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Honda City</p>
                  <p className="text-muted">i-VTEC VX MT: <strong className="text-ink">₹13.92 Lakh</strong></p>
                  <p className="text-muted">i-VTEC V CVT: <strong className="text-ink">₹13.97 Lakh</strong></p>
                  <p className="text-muted">i-VTEC VX CVT: <strong className="text-ink">₹15.07 Lakh</strong></p>
                  <span className="text-[10px] text-good block mt-1">✓ Super-smooth CVT + LaneWatch</span>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Hyundai Verna</p>
                  <p className="text-muted">1.5L MPi HX 6+ MT: <strong className="text-ink">₹13.80 Lakh</strong></p>
                  <p className="text-muted">1.5L MPi HX 6 iVT: <strong className="text-ink">₹14.23 Lakh</strong></p>
                  <p className="text-muted">1.5L Turbo HX 8 MT: <strong className="text-ink">₹14.83 Lakh</strong></p>
                  <span className="text-[10px] text-accent block mt-1">✓ 160 PS Turbo entry from ₹14.83L</span>
                </div>
              </div>
            </div>

            {/* Flagship Tier */}
            <div className="rounded-2xl border border-line bg-paper/40 p-5 space-y-3">
              <span className="rounded-md bg-good px-2 py-0.5 text-[10px] font-bold text-card uppercase">
                Tier 3: Flagship Luxury & Performance (₹16.0L – ₹18.5L+)
              </span>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Škoda Slavia</p>
                  <p className="text-muted">1.5L Sportline DSG: <strong className="text-ink">₹16.19 Lakh</strong></p>
                  <p className="text-muted">1.5L Prestige DSG: <strong className="text-ink">₹18.04 Lakh</strong></p>
                  <p className="text-muted">1.5L Monte Carlo DSG: <strong className="text-ink">₹18.29 Lakh</strong></p>
                  <span className="text-[10px] text-good block mt-1">✓ 150 PS EVO, ACT, Subwoofer Audio</span>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Honda City</p>
                  <p className="text-muted">i-VTEC ZX CVT: <strong className="text-ink">₹16.35 Lakh</strong></p>
                  <p className="text-muted">e:HEV ZX Hybrid: <strong className="text-ink">₹20.55 Lakh</strong></p>
                  <span className="text-[10px] text-good block mt-1">✓ 27.26 km/l Atkinson cycle full hybrid</span>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="font-bold text-ink">Hyundai Verna</p>
                  <p className="text-muted">1.5L Turbo HX 8 DCT: <strong className="text-ink">₹16.08 Lakh</strong></p>
                  <p className="text-muted">1.5L Turbo HX 10 DCT: <strong className="text-ink">₹17.42 Lakh</strong></p>
                  <span className="text-[10px] text-accent block mt-1">✓ Level 2 ADAS, Bose Audio, 360 Cam</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 8. EXPERT BUYER VERDICT                                        */}
      {/* ============================================================== */}
      {(activeCategoryTab === "all" || activeCategoryTab === "verdict") && (
        <section className="rounded-3xl border border-line bg-gradient-to-b from-card to-paper/60 p-6 shadow-xs sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-accent-soft px-3.5 py-1 text-xs font-bold text-accent uppercase tracking-wider">
              CarBikeKharido Editorial Verdict
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">
              Which Midsize Sedan Should You Buy?
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Slavia Verdict */}
            <div className="rounded-2xl border border-line bg-card p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-ink px-2.5 py-1 text-xs font-bold text-card">
                  Buy Škoda Slavia
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink">The Driver’s Sedan</h3>
              <p className="text-xs text-muted leading-relaxed">
                Choose the Slavia if you crave European highway stability, direct steering feedback, class-leading 179 mm ground clearance that handles rough Indian roads like an SUV, a massive 521L boot, and the punchy 150 PS TSI EVO engine with Active Cylinder Technology.
              </p>
              <ul className="text-xs space-y-1 text-ink border-t border-line/60 pt-3">
                <li>• 5-Star Global NCAP (Adult & Child)</li>
                <li>• 179 mm clearance (best in segment)</li>
                <li>• 1.5L TSI EVO + 7-Speed DSG dynamics</li>
                <li>• 521 L boot (expandable to 1,050 L)</li>
              </ul>
            </div>

            {/* City Verdict */}
            <div className="rounded-2xl border border-line bg-card p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-good px-2.5 py-1 text-xs font-bold text-card">
                  Buy Honda City
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink">Comfort & Hybrid King</h3>
              <p className="text-xs text-muted leading-relaxed">
                Choose the City if you prioritize unmatched rear-seat lounge comfort, legendary Honda reliability, silky smooth naturally aspirated i-VTEC power delivery, or mind-boggling 27.26 km/l fuel efficiency with the e:HEV self-charging strong hybrid.
              </p>
              <ul className="text-xs space-y-1 text-ink border-t border-line/60 pt-3">
                <li>• 27.26 km/l ARAI mileage (e:HEV)</li>
                <li>• Supreme sofa-like rear seat comfort</li>
                <li>• Honda SENSING standard on all CVT trims</li>
                <li>• Zero range anxiety with 1,000+ km tank</li>
              </ul>
            </div>

            {/* Verna Verdict */}
            <div className="rounded-2xl border border-line bg-card p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-card">
                  Buy Hyundai Verna
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink">Tech & Pure Power</h3>
              <p className="text-xs text-muted leading-relaxed">
                Choose the Verna if you want the fastest acceleration in the segment (160 PS Turbo GDi, 0-100 in 8.1s), the most comprehensive Level-2 ADAS suite (17 active safety features), dual 10.25&quot; screens, heated &amp; ventilated seats, and futuristic styling.
              </p>
              <ul className="text-xs space-y-1 text-ink border-t border-line/60 pt-3">
                <li>• 160 PS / 253 Nm (fastest in class)</li>
                <li>• Comprehensive Level-2 ADAS suite</li>
                <li>• Dual 10.25&quot; connected displays + Bose audio</li>
                <li>• 5-Star Global NCAP crash safety</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
