import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Shield, Fuel, Gauge, ExternalLink } from "lucide-react";

interface LinkedVehicle {
  id: string;
  name: string;
  slug: string;
  heroImage: string;
  priceMin: unknown;
  priceMax: unknown;
  category?: string;
  bodyType?: string;
  fuelTypes?: string[];
  transmissionTypes?: string[];
  ncapRating?: number | null;
  mileageOrRange?: string | null;
  brand?: {
    id?: string;
    name: string;
    slug: string;
  } | null;
}

interface VehiclePreviewCardProps {
  vehicle: LinkedVehicle;
}

export function VehiclePreviewCard({ vehicle }: VehiclePreviewCardProps) {
  const brandSlug = vehicle.brand?.slug || "cars";
  const vehicleUrl = `/cars/${brandSlug}/${vehicle.slug}`;
  const compareUrl = `/compare?v1=${vehicle.slug}`;

  const formatPrice = (val: unknown) => {
    if (val == null) return null;
    const num = typeof val === "number" ? val : Number(val);
    if (isNaN(num)) return null;
    return `₹${num.toFixed(2)} Lakh`;
  };

  const min = formatPrice(vehicle.priceMin);
  const max = formatPrice(vehicle.priceMax);
  const priceDisplay =
    min && max ? (min === max ? min : `${min} - ${max}`) : min || "Price on request";

  return (
    <aside
      suppressHydrationWarning
      className="my-10 overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-sm transition-all hover:border-line/80 hover:shadow-md"
      aria-label={`Featured Vehicle: ${vehicle.name}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
            <Sparkles className="size-3.5" /> Featured Vehicle
          </span>
          <span className="text-xs font-medium text-muted">
            {vehicle.brand?.name || "Automotive"}
          </span>
        </div>
        {vehicle.ncapRating ? (
          <div className="flex items-center gap-1 text-xs font-semibold text-good">
            <Shield className="size-3.5" />
            <span>{vehicle.ncapRating}-Star Safety</span>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Vehicle Image */}
        <div className="md:col-span-5 relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-paper border border-line/50">
          {vehicle.heroImage ? (
            <Image
              src={vehicle.heroImage}
              alt={vehicle.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted text-sm">
              No image available
            </div>
          )}
        </div>

        {/* Details & Specs */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted">
              {vehicle.bodyType || vehicle.category || "Vehicle"}
            </div>
            <h3 className="mt-1 font-display text-2xl font-bold text-ink">
              {vehicle.name}
            </h3>
            <p className="mt-1 text-lg font-bold text-accent">
              {priceDisplay}
              <span className="ml-1 text-xs font-normal text-muted">
                (Ex-showroom)
              </span>
            </p>
          </div>

          {/* Quick Specs Badges */}
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {vehicle.mileageOrRange && (
              <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-1 font-medium border border-line">
                <Gauge className="size-3.5 text-ink/70" />
                {vehicle.mileageOrRange}
              </span>
            )}
            {vehicle.fuelTypes && vehicle.fuelTypes.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-1 font-medium border border-line">
                <Fuel className="size-3.5 text-ink/70" />
                {vehicle.fuelTypes.join(", ")}
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={vehicleUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-card transition-all hover:bg-ink/90 shadow-xs"
            >
              <span>View Full Specs</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href={compareUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink/40 hover:bg-white"
            >
              <span>Compare Model</span>
              <ExternalLink className="size-3.5 text-muted" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
