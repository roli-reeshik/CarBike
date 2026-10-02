import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  vehicleCount?: number;
}

interface BrandLogoListProps {
  brands: BrandItem[];
  title?: string;
}

export function BrandLogoList({
  brands,
  title = "Popular Brands",
}: BrandLogoListProps) {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-xs border border-line/70 p-4 h-[620px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line/60 pb-3 mb-4 px-1">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <Link
          href="/cars"
          className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-0.5"
        >
          View All <ChevronRight className="size-3" />
        </Link>
      </div>

      {/* Brand Items Scrollable List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/cars?brand=${encodeURIComponent(brand.slug)}`}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-line/50 hover:border-accent/40 bg-paper/30 hover:bg-paper transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Brand Logo Container */}
              <div className="relative w-11 h-9 shrink-0 flex items-center justify-center rounded-lg bg-white p-1 border border-line/40">
                <Image
                  src={brand.logoUrl || "/vehicles/cars/Brand Logos/skoda.png"}
                  alt={`${brand.name} logo`}
                  fill
                  sizes="44px"
                  className="object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Brand Name */}
              <span className="text-xs font-bold text-ink group-hover:text-accent transition-colors truncate">
                {brand.name}
              </span>
            </div>

            {/* Vehicle Count Badge or Arrow */}
            <div className="flex items-center gap-1 shrink-0">
              {typeof brand.vehicleCount === "number" && brand.vehicleCount > 0 && (
                <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {brand.vehicleCount}
                </span>
              )}
              <ChevronRight className="size-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
