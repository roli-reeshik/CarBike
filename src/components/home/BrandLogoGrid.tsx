import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { BrandItem } from "./BrandLogoList";

interface BrandLogoGridProps {
  brands: BrandItem[];
  title?: string;
  subtitle?: string;
}

export function BrandLogoGrid({
  brands,
  title = "Explore by Popular Brands",
  subtitle = "Direct access to official models, verified prices, and authorized showrooms.",
}: BrandLogoGridProps) {
  return (
    <section className="rounded-3xl border border-line bg-card p-6 shadow-xs sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
            <Sparkles className="size-3.5" />
            Verified OEM Manufacturers
          </div>
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</p>
        </div>

        <Link
          href="/cars"
          className="text-xs font-bold text-accent hover:underline self-start sm:self-auto shrink-0"
        >
          View All Brands &rarr;
        </Link>
      </div>

      {/* Grid of Brand Logos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/cars?brand=${encodeURIComponent(brand.slug)}`}
            className="flex flex-col items-center justify-center rounded-2xl border border-line/60 bg-paper/40 p-4 hover:border-accent/40 hover:bg-card hover:shadow-xs transition-all group text-center"
          >
            <div className="relative h-12 w-20 flex items-center justify-center">
              <Image
                src={brand.logoUrl || "/vehicles/cars/Brand Logos/skoda.png"}
                alt={`${brand.name} logo`}
                fill
                sizes="80px"
                className="object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <span className="mt-2.5 text-xs font-bold text-ink group-hover:text-accent transition-colors line-clamp-1">
              {brand.name}
            </span>
            {typeof brand.vehicleCount === "number" && (
              <span className="text-[10px] text-muted font-medium mt-0.5">
                {brand.vehicleCount} Models
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
