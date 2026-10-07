"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Sparkles, Newspaper, Star, Compass, Zap, Wrench } from "lucide-react";

export const BLOG_CATEGORIES = [
  { id: "ALL", label: "All Stories", icon: Sparkles },
  { id: "NEWS", label: "Car & Bike News", icon: Newspaper },
  { id: "REVIEWS", label: "Reviews", icon: Star },
  { id: "BUYING_GUIDES", label: "Buying Guides", icon: Compass },
  { id: "EV_INSIGHTS", label: "EV Insights", icon: Zap },
  { id: "MAINTENANCE", label: "Maintenance", icon: Wrench },
] as const;

interface CategoryFilterBarProps {
  currentCategory: string;
  currentSearch: string;
}

export function CategoryFilterBar({
  currentCategory = "ALL",
  currentSearch = "",
}: CategoryFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  const updateFilters = (newCategory?: string, newQuery?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategory !== undefined) {
      if (newCategory === "ALL") {
        params.delete("category");
      } else {
        params.set("category", newCategory);
      }
    }

    if (newQuery !== undefined) {
      if (!newQuery.trim()) {
        params.delete("q");
      } else {
        params.set("q", newQuery.trim());
      }
    }

    params.delete("page"); // reset pagination on filter change

    startTransition(() => {
      router.push(`/blogs?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    updateFilters(undefined, "");
  };

  return (
    <div className="space-y-6">
      {/* Search Input & Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-lg"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news, reviews, EV guides, car models..."
              className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </form>

        <div className="text-xs text-muted flex items-center gap-2">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 text-accent animate-pulse font-medium">
              Updating stories...
            </span>
          ) : (
            <span>Auto Newsroom &amp; Technical Editorial</span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {BLOG_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive =
            currentCategory === cat.id ||
            (!currentCategory && cat.id === "ALL");

          return (
            <button
              key={cat.id}
              onClick={() => updateFilters(cat.id, undefined)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-ink text-card shadow-sm"
                  : "border border-line bg-card/80 text-muted hover:border-ink/40 hover:text-ink hover:bg-card"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
