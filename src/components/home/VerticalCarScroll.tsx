"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface CarCardItem {
  id: string;
  name: string;
  brandName: string;
  priceFormatted: string;
  launchDate?: string;
  fuelType?: string;
  imageUrl: string;
  href: string;
}

interface VerticalCarScrollProps {
  title: string;
  badge?: string;
  cars: CarCardItem[];
}

export function VerticalCarScroll({
  title,
  badge,
  cars,
}: VerticalCarScrollProps) {
  // If list is empty, display placeholder
  if (!cars || cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-xs border border-line/60 p-6 h-[620px] w-full text-center">
        <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
        <p className="text-xs text-muted">No vehicles listed right now.</p>
      </div>
    );
  }

  // Duplicate list to ensure infinite continuous loop
  const displayList = [...cars, ...cars];

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow-xs border border-line/70 p-4 overflow-hidden h-[620px] w-full">
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-line/60 pb-3 mb-4 w-full px-1">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        {badge && (
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            {badge}
          </span>
        )}
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative w-full h-full overflow-hidden group">
        <div className="flex flex-col gap-3.5 animate-vertical-scroll hover:[animation-play-state:paused] active:[animation-play-state:paused] focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]">
          {displayList.map((car, idx) => (
            <Link
              key={`${car.id}-${idx}`}
              href={car.href}
              className="relative z-10 flex items-center justify-between gap-3 p-3 bg-paper/50 hover:bg-paper rounded-xl transition-all border border-line/60 hover:border-accent/40 hover:shadow-xs group/card cursor-pointer active:scale-[0.99]"
            >
              {/* Vehicle Thumbnail & Info */}
              <div className="flex items-center gap-3 min-w-0 flex-grow">
                {/* Vehicle Image Thumbnail */}
                <div className="relative w-24 h-16 shrink-0 bg-white rounded-lg overflow-hidden p-1 flex items-center justify-center border border-line/40">
                  <Image
                    src={car.imageUrl || "/vehicles/cars/skoda/skoda-slavia/Candy White.png"}
                    alt={car.name}
                    fill
                    sizes="96px"
                    className="object-contain group-hover/card:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Vehicle Details */}
                <div className="flex flex-col flex-grow min-w-0">
                  <span className="text-[11px] text-muted font-medium truncate">
                    {car.brandName}
                  </span>
                  <h4 className="text-sm font-bold text-ink line-clamp-1 group-hover/card:text-accent transition-colors">
                    {car.name}
                  </h4>
                  <span className="text-xs font-bold text-good mt-0.5">
                    {car.priceFormatted}
                  </span>
                  {car.launchDate && (
                    <span className="text-[10px] font-semibold text-accent mt-0.5">
                      Launch: {car.launchDate}
                    </span>
                  )}
                  {car.fuelType && !car.launchDate && (
                    <span className="text-[10px] text-muted mt-0.5 line-clamp-1">
                      {car.fuelType}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Chevron */}
              <div className="shrink-0 flex items-center pr-1 text-muted/60 group-hover/card:text-accent group-hover/card:translate-x-0.5 transition-all">
                <ChevronRight className="size-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
