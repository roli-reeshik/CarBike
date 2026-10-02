"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VehicleCategory } from "@/lib/requirements";

type RequirementState = {
  category: VehicleCategory;
  brand: string;
  budget: string;
  fuel: string;
  transmission: string;
  seating: string;
  riding: string;
  bodyType: string;
  setCategory: (category: VehicleCategory) => void;
  setBrand: (brand: string) => void;
  setBudget: (budget: string) => void;
  setFuel: (fuel: string) => void;
  setTransmission: (transmission: string) => void;
  setSeating: (seating: string) => void;
  setRiding: (riding: string) => void;
  setBodyType: (bodyType: string) => void;
  reset: () => void;
};

const cleared = {
  brand: "",
  budget: "",
  fuel: "",
  transmission: "",
  seating: "",
  riding: "",
  bodyType: "",
};

export const useRequirementStore = create<RequirementState>()(
  persist(
    (set) => ({
      category: "CAR",
      ...cleared,
      setCategory: (category) =>
        set((state) =>
          state.category === category
            ? state
            : { category, brand: "", budget: "", seating: "", riding: "", bodyType: "" },
        ),
      setBrand: (brand) => set({ brand }),
      setBudget: (budget) => set({ budget }),
      setFuel: (fuel) => set({ fuel }),
      setTransmission: (transmission) => set({ transmission }),
      setSeating: (seating) => set({ seating }),
      setRiding: (riding) => set({ riding }),
      setBodyType: (bodyType) => set({ bodyType }),
      reset: () => set(cleared),
    }),
    { name: "cbk-requirements" },
  ),
);
