"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Phone, ShieldCheck, Star } from "lucide-react";
import type { CatalogColor, CatalogVehicle } from "@/lib/requirements";
import { dealerCityOptions } from "@/lib/requirements";
import { AddToCompare } from "@/components/add-to-compare";
import { LeadCapture } from "@/components/lead-capture";
import { cn, formatInr, telHref } from "@/lib/utils";

export function VehicleResult({
  vehicle,
  transmission = "",
}: {
  vehicle: CatalogVehicle;
  transmission?: string;
}) {
  const colors = vehicle.colors.length
    ? vehicle.colors
    : [
        {
          id: "hero",
          name: "Studio",
          hexCode: "#1A1714",
          previewUrl: vehicle.heroImage,
        },
      ];
  const variants = transmission
    ? vehicle.variants.filter(
        (item) => item.transmission.toLowerCase() === transmission.toLowerCase(),
      )
    : vehicle.variants;
  const visibleVariants = variants.length > 0 ? variants : vehicle.variants;
  const [colorId, setColorId] = useState(colors[0].id);
  const [variantId, setVariantId] = useState(visibleVariants[0]?.id ?? "");
  const [city, setCity] = useState("all");
  const [imgError, setImgError] = useState(false);

  const color = colors.find((item) => item.id === colorId) ?? colors[0];
  const variant =
    visibleVariants.find((item) => item.id === variantId) ?? visibleVariants[0];

  useEffect(() => {
    setImgError(false);
  }, [color.previewUrl]);
  const cities = useMemo(
    () => dealerCityOptions(vehicle.dealers),
    [vehicle.dealers],
  );
  const dealers =
    city === "all"
      ? vehicle.dealers
      : vehicle.dealers.filter((dealer) => dealer.city === city);

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_60px_-36px_rgba(26,23,20,0.55)]">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative flex min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] w-full items-center justify-center bg-gradient-to-br from-[#f8f6f0] via-[#ece7dc] to-[#e0dad0] p-4 lg:p-6">
          <div className="relative aspect-[16/10] w-full max-w-xl">
            <Image
              key={`${vehicle.id}-${color.id}-${color.previewUrl}`}
              src={
                imgError
                  ? vehicle.heroImage || "/vehicles/placeholder.svg"
                  : color.previewUrl || vehicle.heroImage || "/vehicles/placeholder.svg"
              }
              alt={`${vehicle.brandName} ${vehicle.name} in ${color.name}`}
              data-ci-type={vehicle.category === "BIKE" ? "moto" : "car"}
              data-ci-make={vehicle.brandName}
              data-ci-model={vehicle.name}
              fill
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-contain drop-shadow-2xl transition-all duration-300"
              onError={() => {
                if (!imgError && color.previewUrl !== vehicle.heroImage) {
                  setImgError(true);
                }
              }}
            />
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-sm shadow-sm backdrop-blur-sm">
            <span
              className="size-4 rounded-full border border-black/10 shadow-inner"
              style={{ backgroundColor: color.hexCode }}
              aria-hidden
            />
            <span className="font-medium text-ink">{color.name}</span>
            <span className="font-mono text-xs uppercase text-muted">
              {color.hexCode}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <LaunchBadge vehicle={vehicle} />
            {vehicle.ncapRating ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-good-soft px-3 py-1 text-sm font-medium text-good">
                <ShieldCheck className="size-4" aria-hidden />
                {vehicle.ncapRating}-star safety
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-medium tracking-wide text-muted">
              {vehicle.brandName}
            </p>
            <h2 className="mt-1 font-display text-4xl leading-none text-ink">
              {vehicle.name}
            </h2>
            {vehicle.tagline ? (
              <p className="mt-3 text-base text-muted">{vehicle.tagline}</p>
            ) : null}
          </div>

          <p className="text-lg font-medium text-ink">{priceLine(vehicle)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <LeadCapture
              vehicleId={vehicle.id}
              vehicleName={vehicle.name}
              launchStatus={vehicle.launchStatus}
              variantId={variant?.id}
              variantName={variant?.name}
              cities={cities}
            />
            <AddToCompare vehicle={vehicle} />
            <Link
              href={
                vehicle.category === "CAR"
                  ? `/cars/${vehicle.brandSlug || "honda-cars"}/${vehicle.slug}`
                  : `/cars/${vehicle.slug}`
              }
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-ink/20 bg-paper px-4 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-card"
            >
              <span>View Full Specs & Trims</span>
              <ChevronRight className="size-4 text-accent" />
            </Link>
          </div>
          {vehicle.preBookingAmount ? (
            <p className="text-sm text-accent">
              Pre-book for {formatInr(Number(vehicle.preBookingAmount))}
            </p>
          ) : null}

          <div>
            <p className="text-sm font-medium text-ink">Colours</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Colours">
              {colors.map((swatch) => (
                <ColorSwatch
                  key={swatch.id}
                  color={swatch}
                  selected={swatch.id === color.id}
                  onSelect={() => setColorId(swatch.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <dl className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
        <Spec label="Powertrain" value={vehicle.engineOrBattery} />
        <Spec label="Power output" value={vehicle.powerBhp} />
        <Spec label="Torque" value={vehicle.torqueNm} />
        <Spec label="ARAI mileage / range" value={vehicle.mileageOrRange} />
      </dl>

      {variant ? (
        <section className="border-t border-line p-6 sm:p-8">
          <h3 className="text-sm font-semibold tracking-wide text-muted uppercase">
            Trims
          </h3>
          <div
            className="mt-3 flex gap-2 overflow-x-auto"
            role="tablist"
            aria-label="Trims"
          >
            {visibleVariants.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === variant.id}
                onClick={() => setVariantId(item.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  item.id === variant.id
                    ? "border-ink bg-ink text-card"
                    : "border-line bg-card text-ink hover:border-ink/30",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2" role="tabpanel">
            <PriceTile label="Ex-showroom" value={formatInr(variant.exShowroomPrice)} />
            <PriceTile
              label="On-road estimate"
              value={formatInr(variant.onRoadPriceEst)}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {variant.transmission}
            {variant.seatingCapacity
              ? ` · ${variant.seatingCapacity} seats`
              : ""}
            . On-road is an estimate, before local offers.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {variant.keyFeatures.map((feature) => (
              <li
                key={feature}
                className="rounded-full bg-paper px-3 py-1 text-sm text-ink"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-10 border-t border-line p-6 sm:p-8 lg:grid-cols-2">
        <section>
          <h3 className="font-display text-2xl text-ink">Verified owner reviews</h3>
          {vehicle.reviews.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No verified owner reviews yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {vehicle.reviews.map((review) => (
                <li key={review.id} className="rounded-2xl bg-paper p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={review.ratingOverall} />
                    {review.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-good">
                        <ShieldCheck className="size-3.5" aria-hidden />
                        Verified owner
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 font-medium text-ink">{review.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/80">
                    {review.comment}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    {review.authorName} · {review.city}
                    {review.ratingMileage
                      ? ` · Mileage ${review.ratingMileage}/5`
                      : ""}
                    {review.ratingComfort
                      ? ` · Comfort ${review.ratingComfort}/5`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="font-display text-2xl text-ink">Dealers</h3>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-muted">City</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-10 rounded-xl border border-line bg-card px-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="all">All cities</option>
                {cities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {dealers.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              {city === "all"
                ? "Dealer listings are not in yet."
                : `No dealers in ${city} for this model yet.`}
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {dealers.map((dealer) => (
                <li
                  key={dealer.id}
                  className="rounded-2xl border border-line p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{dealer.name}</p>
                      <p className="mt-1 text-sm text-muted">{dealer.city}</p>
                      <p className="mt-1 text-sm text-ink/80">{dealer.address}</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-ink">
                      {dealer.rating.toFixed(1)}
                    </p>
                  </div>
                  <a
                    href={telHref(dealer.phone)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    <Phone className="size-4" aria-hidden />
                    Call {dealer.phone}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}

function ColorSwatch({
  color,
  selected,
  onSelect,
}: {
  color: CatalogColor;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${color.name}, ${color.hexCode}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2 py-1 pr-3 text-sm",
        selected ? "border-ink" : "border-line hover:border-ink/30",
      )}
    >
      <span
        className="size-7 rounded-full border border-black/10"
        style={{ backgroundColor: color.hexCode }}
        aria-hidden
      />
      {color.name}
    </button>
  );
}

function LaunchBadge({ vehicle }: { vehicle: CatalogVehicle }) {
  if (vehicle.launchStatus === "PRE_BOOKING_OPEN") {
    return <Badge className="bg-accent-soft text-accent">Pre-booking open</Badge>;
  }
  if (vehicle.launchStatus === "UPCOMING") {
    const when = vehicle.expectedLaunchDate
      ? vehicle.isDateConfirmed
        ? vehicle.expectedLaunchDate
        : `Expected ${vehicle.expectedLaunchDate}`
      : "Date to be announced";
    return <Badge className="bg-[#f3ead2] text-[#7a5b12]">Upcoming · {when}</Badge>;
  }
  if (vehicle.launchStatus === "DISCONTINUED") {
    return <Badge className="bg-paper text-muted">Discontinued</Badge>;
  }
  return <Badge className="bg-good-soft text-good">On sale</Badge>;
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-base font-medium text-ink">{value}</dd>
    </div>
  );
}

function PriceTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-medium text-ink">{value}</p>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "size-4",
            index < value ? "fill-accent text-accent" : "text-line",
          )}
        />
      ))}
    </span>
  );
}

function priceLine(vehicle: CatalogVehicle) {
  if (
    vehicle.launchStatus !== "LAUNCHED" &&
    vehicle.expectedPriceMinLakh != null &&
    vehicle.expectedPriceMaxLakh != null
  ) {
    return `Expected ₹${trimLakh(vehicle.expectedPriceMinLakh)}–${trimLakh(vehicle.expectedPriceMaxLakh)} L`;
  }
  return `${formatInr(vehicle.priceMin)} – ${formatInr(vehicle.priceMax)} ex-showroom`;
}

function trimLakh(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
