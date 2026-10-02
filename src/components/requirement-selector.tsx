"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bike, Car, ChevronDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  SEATING_OPTIONS,
  RIDING_OPTIONS,
  budgetsFor,
  searchVehicles,
  type CatalogVehicle,
} from "@/lib/requirements";
import { BIKE_BODY_TYPES, CAR_BODY_TYPES } from "@/constants/vehicle";
import { useRequirementStore } from "@/stores/requirement-store";
import { cn, formatInr } from "@/lib/utils";
import { VehicleResult } from "@/components/vehicle-result";

export function RequirementSelector({
  vehicles,
}: {
  vehicles: CatalogVehicle[];
}) {
  const category = useRequirementStore((state) => state.category);
  const brand = useRequirementStore((state) => state.brand);
  const budget = useRequirementStore((state) => state.budget);
  const fuel = useRequirementStore((state) => state.fuel);
  const transmission = useRequirementStore((state) => state.transmission);
  const seating = useRequirementStore((state) => state.seating);
  const riding = useRequirementStore((state) => state.riding);
  const setCategory = useRequirementStore((state) => state.setCategory);
  const setBrand = useRequirementStore((state) => state.setBrand);
  const setBudget = useRequirementStore((state) => state.setBudget);
  const setFuel = useRequirementStore((state) => state.setFuel);
  const setTransmission = useRequirementStore((state) => state.setTransmission);
  const setSeating = useRequirementStore((state) => state.setSeating);
  const setRiding = useRequirementStore((state) => state.setRiding);
  const reset = useRequirementStore((state) => state.reset);
  const [bodyType, setBodyType] = useState<string>("any");

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    for (const v of vehicles) {
      if (v.category === category && v.brandName) {
        brandSet.add(v.brandName);
      }
    }
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, [vehicles, category]);

  function handleCategorySwitch(next: "CAR" | "BIKE") {
    setCategory(next);
    setBodyType("any");
    setBrand("");
  }
  function clearFilters() {
    setBrand("");
    setQuery("");
    setRemote(null);
    setBodyType("any");
    reset();
  }
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<CatalogVehicle[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const localMatches = useMemo(
    () =>
      searchVehicles(vehicles, {
        category,
        brand,
        budget,
        fuel,
        transmission,
        seating,
        riding,
        bodyType,
        q: query,
      }),
    [vehicles, category, brand, budget, fuel, transmission, seating, riding, bodyType, query],
  );
  const matches = remote ?? localMatches;
  const active = matches.find((vehicle) => vehicle.id === activeId) ?? matches[0];

  useEffect(() => {
    setRemote(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ category });
      if (brand) params.set("brand", brand);
      if (budget) params.set("budget", budget);
      if (fuel) params.set("fuel", fuel);
      if (transmission) params.set("transmission", transmission);
      if (seating) params.set("seating", seating);
      if (riding) params.set("riding", riding);
      if (bodyType !== "any") params.set("bodyType", bodyType);
      if (query.trim()) params.set("q", query.trim());

      fetch(`/api/vehicles?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Catalogue request failed");
          return (await response.json()) as { vehicles: CatalogVehicle[] };
        })
        .then((payload) => {
          setRemote(payload.vehicles);
          setListError(null);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") return;
          setListError("Showing the saved catalogue. Live search did not respond.");
        });
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, brand, budget, fuel, transmission, seating, riding, bodyType, query]);
  const noun = category === "CAR" ? "car" : "bike";
  const budgets = budgetsFor(category);

  return (
    <section className="space-y-6">
      <div
        className="grid grid-cols-2 gap-2 rounded-2xl bg-[#ebe4d8] p-1.5"
        role="group"
        aria-label="What are you looking for?"
      >
        <ToggleButton
          pressed={category === "CAR"}
          onClick={() => handleCategorySwitch("CAR")}
          icon={<Car className="size-4" aria-hidden />}
          label="Looking for a Car"
        />
        <ToggleButton
          pressed={category === "BIKE"}
          onClick={() => handleCategorySwitch("BIKE")}
          icon={<Bike className="size-4" aria-hidden />}
          label="Looking for a Bike"
        />
      </div>

      <div className="rounded-3xl border border-line bg-card p-4 sm:p-5">
        <div className="mb-4">
          <SelectField
            id="brand"
            label="Search by Brand"
            value={brand}
            onChange={(value) => {
              setRemote(null);
              setBrand(value);
            }}
          >
            <option value="">All Brands</option>
            {availableBrands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SelectField
            id="body-type"
            label="Vehicle Type"
            value={bodyType}
            onChange={(value) => {
              setRemote(null);
              setBodyType(value);
            }}
          >
            <option value="any">
              {category === "CAR" ? "All Body Types" : "All Styles"}
            </option>
            {(category === "CAR" ? CAR_BODY_TYPES : BIKE_BODY_TYPES).map(
              (option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ),
            )}
          </SelectField>
          <SelectField
            id="budget"
            label="Budget range"
            value={budget}
            onChange={setBudget}
          >
            <option value="">Any budget</option>
            {budgets.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <SelectField id="fuel" label="Fuel / powertrain" value={fuel} onChange={setFuel}>
            <option value="">Any fuel</option>
            {FUEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
          <SelectField
            id="transmission"
            label="Transmission"
            value={transmission}
            onChange={setTransmission}
          >
            <option value="">Any transmission</option>
            {TRANSMISSION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
          {category === "CAR" ? (
            <SelectField
              id="seating"
              label="Seating capacity"
              value={seating}
              onChange={setSeating}
            >
              <option value="">Any seating</option>
              {SEATING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          ) : (
            <SelectField
              id="riding"
              label="Riding segment"
              value={riding}
              onChange={setRiding}
            >
              <option value="">Any segment</option>
              {RIDING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset filters
          </button>
        </div>
      </div>

      {listError ? (
        <p className="text-sm text-accent" role="status">
          {listError}
        </p>
      ) : null}
      <p className="text-sm text-muted" aria-live="polite">
        {matches.length === 0
          ? `No ${noun}s match these criteria.`
          : matches.length === 1
            ? `1 ${noun} matches.`
            : `${matches.length} ${noun}s match.`}
      </p>

      {matches.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {matches.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              aria-pressed={vehicle.id === active.id}
              onClick={() => setActiveId(vehicle.id)}
              className={cn(
                "shrink-0 rounded-2xl border px-4 py-3 text-left",
                vehicle.id === active.id
                  ? "border-ink bg-ink text-card"
                  : "border-line bg-card text-ink",
              )}
            >
              <span className="block text-xs opacity-70">{vehicle.brandName}</span>
              <span className="block text-sm font-medium">{vehicle.name}</span>
              <span className="mt-1 block text-xs opacity-70">
                {formatInr(vehicle.priceMin)}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={`${active.id}-${transmission}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <VehicleResult vehicle={active} transmission={transmission} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center"
          >
            <p className="font-display text-3xl text-ink">
              No {noun}s match that brief.
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Nothing in the catalogue fits this budget, fuel, and{" "}
              {category === "CAR" ? "seating" : "riding"} mix. Clear the
              criteria and start again.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset criteria
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ToggleButton({
  pressed,
  onClick,
  icon,
  label,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors sm:text-base",
        pressed ? "bg-ink text-card shadow-sm" : "text-muted hover:text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-line bg-paper px-3 pr-10 text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </span>
    </label>
  );
}
