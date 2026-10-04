"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, CalendarClock } from "lucide-react";
import { VerticalCarScroll, type CarCardItem } from "./VerticalCarScroll";
import { type BrandItem } from "./BrandLogoList";
import { cn } from "@/lib/utils";

interface HomeCarShowcaseProps {
  brands?: BrandItem[];
  newLaunches: CarCardItem[];
  upcoming: CarCardItem[];
  popular: CarCardItem[];
}

type TabOption = "new_launches" | "upcoming" | "popular";

export function HomeCarShowcase({
  newLaunches,
  upcoming,
  popular,
}: HomeCarShowcaseProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<TabOption>("new_launches");

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
            <Sparkles className="size-3.5" />
            Live Marketplace Showcase
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Cars in India — Explore Brands &amp; New Launches
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Continuous real-time showcase of official authorized brands, fresh market entries, upcoming EVs, and customer favorites.
          </p>
        </div>
      </div>

      {/* Mobile / Tablet Tab Switcher (< lg) */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveMobileTab("new_launches")}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeMobileTab === "new_launches"
              ? "bg-ink text-card shadow-xs"
              : "bg-card text-muted border border-line hover:text-ink"
          )}
        >
          <Sparkles className="size-3.5" />
          New Launch Cars ({newLaunches.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab("upcoming")}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeMobileTab === "upcoming"
              ? "bg-ink text-card shadow-xs"
              : "bg-card text-muted border border-line hover:text-ink"
          )}
        >
          <CalendarClock className="size-3.5" />
          Upcoming Cars ({upcoming.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab("popular")}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeMobileTab === "popular"
              ? "bg-ink text-card shadow-xs"
              : "bg-card text-muted border border-line hover:text-ink"
          )}
        >
          <TrendingUp className="size-3.5" />
          Popular Cars ({popular.length})
        </button>
      </div>

      {/* Mobile View: Render Selected Column */}
      <div className="block lg:hidden max-w-md mx-auto">
        {activeMobileTab === "new_launches" && (
          <VerticalCarScroll
            title="a. New Launch Cars"
            badge="Latest"
            cars={newLaunches}
          />
        )}
        {activeMobileTab === "upcoming" && (
          <VerticalCarScroll
            title="b. Upcoming Cars"
            badge="Upcoming"
            cars={upcoming}
          />
        )}
        {activeMobileTab === "popular" && (
          <VerticalCarScroll
            title="c. Popular Cars"
            badge="Trending"
            cars={popular}
          />
        )}
      </div>

      {/* Desktop Multi-Column Grid (lg: 3 Side-by-Side Columns for a, b, c) */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
        {/* Column a: New Launch Cars */}
        <div className="w-full">
          <VerticalCarScroll
            title="a. New Launch Cars"
            badge="Latest"
            cars={newLaunches}
          />
        </div>

        {/* Column b: Upcoming Cars */}
        <div className="w-full">
          <VerticalCarScroll
            title="b. Upcoming Cars"
            badge="Upcoming"
            cars={upcoming}
          />
        </div>

        {/* Column c: Popular Cars */}
        <div className="w-full">
          <VerticalCarScroll
            title="c. Popular Cars"
            badge="Trending"
            cars={popular}
          />
        </div>
      </div>
    </section>
  );
}
