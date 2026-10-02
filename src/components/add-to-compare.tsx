"use client";

import { Check, Plus } from "lucide-react";
import type { CatalogVehicle } from "@/lib/requirements";
import {
  COMPARISON_LIMIT,
  toComparisonVehicle,
  useComparisonStore,
} from "@/stores/useComparisonStore";
import { cn } from "@/lib/utils";

export function AddToCompare({ vehicle }: { vehicle: CatalogVehicle }) {
  const items = useComparisonStore((state) => state.items);
  const add = useComparisonStore((state) => state.add);
  const remove = useComparisonStore((state) => state.remove);
  const saved = items.some((item) => item.id === vehicle.id);
  const full = !saved && items.length >= COMPARISON_LIMIT;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (saved) {
            remove(vehicle.id);
            return;
          }
          add(toComparisonVehicle(vehicle));
        }}
        disabled={full}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium",
          saved
            ? "bg-ink text-card"
            : "border border-line bg-paper text-ink hover:border-ink/30",
          full && "cursor-not-allowed opacity-50",
        )}
      >
        {saved ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Plus className="size-4" aria-hidden />
        )}
        {saved ? "In comparison" : "Add to compare"}
      </button>
      {full ? (
        <p className="mt-2 text-xs text-muted">
          The tray holds {COMPARISON_LIMIT} vehicles. Remove one to add this.
        </p>
      ) : null}
    </div>
  );
}
