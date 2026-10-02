"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { compareRunningCost, type RunningCostQuote } from "@/lib/calculators";
import { cn } from "@/lib/utils";
import { Field, TextInput } from "@/components/calculators/fields";

const schema = z.object({
  dailyKm: z.number().positive().max(1000),
  petrolPricePerLitre: z.number().positive(),
  petrolKmPerLitre: z.number().positive(),
  dieselPricePerLitre: z.number().positive(),
  dieselKmPerLitre: z.number().positive(),
  electricityPricePerKwh: z.number().positive(),
  evKmPerKwh: z.number().positive(),
});

type FormValues = z.infer<typeof schema>;

export function RunningCostComparator() {
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      dailyKm: 40,
      petrolPricePerLitre: 105,
      petrolKmPerLitre: 16,
      dieselPricePerLitre: 92,
      dieselKmPerLitre: 20,
      electricityPricePerKwh: 8,
      evKmPerKwh: 7,
    },
  });
  const values = watch();
  const parsed = schema.safeParse({
    dailyKm: Number(values.dailyKm),
    petrolPricePerLitre: Number(values.petrolPricePerLitre),
    petrolKmPerLitre: Number(values.petrolKmPerLitre),
    dieselPricePerLitre: Number(values.dieselPricePerLitre),
    dieselKmPerLitre: Number(values.dieselKmPerLitre),
    electricityPricePerKwh: Number(values.electricityPricePerKwh),
    evKmPerKwh: Number(values.evKmPerKwh),
  });
  const quote = useMemo(
    () => (parsed.success ? compareRunningCost(parsed.data) : null),
    [parsed],
  );

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="font-display text-3xl text-ink">EV running cost</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        ₹/km from the price you pay and how far each unit takes you. Monthly
        and yearly figures use the daily distance.
      </p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        noValidate
        onSubmit={(event) => event.preventDefault()}
      >
        <Field label="Daily distance (km)">
          <TextInput
            type="number"
            min={1}
            step={1}
            {...register("dailyKm", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Petrol ₹/litre">
          <TextInput
            type="number"
            min={1}
            step={0.1}
            {...register("petrolPricePerLitre", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Petrol km/litre">
          <TextInput
            type="number"
            min={1}
            step={0.1}
            {...register("petrolKmPerLitre", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Diesel ₹/litre">
          <TextInput
            type="number"
            min={1}
            step={0.1}
            {...register("dieselPricePerLitre", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Diesel km/litre">
          <TextInput
            type="number"
            min={1}
            step={0.1}
            {...register("dieselKmPerLitre", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Electricity ₹/kWh">
          <TextInput
            type="number"
            min={0.1}
            step={0.1}
            {...register("electricityPricePerKwh", { valueAsNumber: true })}
          />
        </Field>
        <Field label="EV km/kWh">
          <TextInput
            type="number"
            min={0.1}
            step={0.1}
            {...register("evKmPerKwh", { valueAsNumber: true })}
          />
        </Field>
      </form>
      {quote ? <CostGrid quote={quote} /> : (
        <p className="mt-4 text-sm text-accent">Enter positive prices and efficiency.</p>
      )}
    </section>
  );
}

function CostGrid({ quote }: { quote: RunningCostQuote }) {
  const columns = [
    ["petrol", "Petrol", quote.petrol],
    ["diesel", "Diesel", quote.diesel],
    ["electric", "Electric", quote.electric],
  ] as const;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {columns.map(([key, label, cost]) => {
        const cheapest = quote.cheapest === key;
        return (
          <article
            key={key}
            className={cn(
              "rounded-2xl border p-4",
              cheapest ? "border-good bg-good-soft" : "border-line bg-paper",
            )}
          >
            <p className="text-sm font-medium text-ink">
              {label}
              {cheapest ? " · lowest ₹/km" : ""}
            </p>
            <p className="mt-2 font-display text-3xl text-ink">
              {formatRupees(cost.perKm)}
              <span className="ml-1 font-sans text-sm text-muted">/km</span>
            </p>
            <p className="mt-3 text-sm text-muted">
              {formatRupees(cost.monthly)} / month
            </p>
            <p className="text-sm text-muted">{formatRupees(cost.yearly)} / year</p>
          </article>
        );
      })}
    </div>
  );
}

function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
