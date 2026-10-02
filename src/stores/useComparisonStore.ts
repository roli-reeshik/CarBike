"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CatalogVehicle, VehicleCategory } from "@/lib/requirements";

export const COMPARISON_LIMIT = 3;

export type ComparisonVehicle = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  category: VehicleCategory;
  heroImage: string;
  priceMin: number;
  priceMax: number;
  fuelTypes: string[];
  transmissionTypes: string[];
  powerBhp: string;
  torqueNm: string;
  mileageOrRange: string;
  seatingCapacity: number | null;
  bikeStyle: string | null;
};

type AddResult = "added" | "exists" | "full";

type ComparisonState = {
  items: ComparisonVehicle[];
  add: (vehicle: ComparisonVehicle) => AddResult;
  remove: (id: string) => void;
  clear: () => void;
};

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (vehicle) => {
        const { items } = get();
        if (items.some((item) => item.id === vehicle.id)) return "exists";
        if (items.length >= COMPARISON_LIMIT) return "full";
        set({ items: [...items, vehicle] });
        return "added";
      },
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "cbk-comparison",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function toComparisonVehicle(vehicle: CatalogVehicle): ComparisonVehicle {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    brandName: vehicle.brandName,
    category: vehicle.category,
    heroImage: vehicle.heroImage,
    priceMin: vehicle.priceMin,
    priceMax: vehicle.priceMax,
    fuelTypes: vehicle.fuelTypes,
    transmissionTypes: vehicle.transmissionTypes,
    powerBhp: vehicle.powerBhp,
    torqueNm: vehicle.torqueNm,
    mileageOrRange: vehicle.mileageOrRange,
    seatingCapacity: vehicle.seatingCapacity,
    bikeStyle: vehicle.bikeStyle,
  };
}
