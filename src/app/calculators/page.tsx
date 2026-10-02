import type { Metadata } from "next";
import { EmiCalculator } from "@/components/calculators/emi-calculator";
import { OnRoadEstimator } from "@/components/calculators/on-road-estimator";
import { RunningCostComparator } from "@/components/calculators/running-cost-comparator";

export const metadata: Metadata = {
  title: "Calculators — CarBikeKharido",
  description:
    "Estimate on-road price, loan EMI, and petrol, diesel, and EV running cost.",
};

export default function CalculatorsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Price the real cost.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Registration, insurance, and TCS for an on-road figure. EMI splits
          principal from interest. Running cost compares ₹/km.
        </p>
      </header>
      <OnRoadEstimator />
      <EmiCalculator />
      <RunningCostComparator />
    </main>
  );
}
