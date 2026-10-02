"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ENGINE_BANDS,
  ROAD_TAX_STATES,
  estimateOnRoad,
  type FuelClass,
  type InsuranceCover,
} from "@/lib/calculators";
import { formatInr } from "@/lib/utils";
import { Field, MoneyRow, SelectInput, TextInput } from "@/components/calculators/fields";

const schema = z.object({
  exShowroom: z.number().positive("Enter an ex-showroom price."),
  stateId: z.string().min(1),
  fuel: z.enum(["petrol", "diesel", "cng", "electric"]),
  vehicleClass: z.enum(["car", "bike"]),
  engineBand: z.string().min(1),
  cover: z.enum(["third_party", "comprehensive"]),
});

type FormValues = z.infer<typeof schema>;

const fuels: { value: FuelClass; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
];

export function OnRoadEstimator() {
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      exShowroom: 731890,
      stateId: "DL",
      fuel: "petrol",
      vehicleClass: "car",
      engineBand: "car-1500",
      cover: "comprehensive",
    },
  });
  const values = watch();
  const parsed = schema.safeParse({
    ...values,
    exShowroom: Number(values.exShowroom),
  });
  const vehicleClass = values.vehicleClass;
  const bands = ENGINE_BANDS[vehicleClass];
  const band =
    bands.find((item) => item.id === values.engineBand) ?? bands[0];

  useEffect(() => {
    if (!bands.some((item) => item.id === values.engineBand)) {
      setValue("engineBand", bands[0].id);
    }
  }, [bands, setValue, values.engineBand]);

  const quote = useMemo(() => {
    if (!parsed.success || !band) return null;
    return estimateOnRoad({
      exShowroom: parsed.data.exShowroom,
      stateId: parsed.data.stateId,
      fuel: parsed.data.fuel,
      vehicleClass: parsed.data.vehicleClass,
      engineCc: band.cc,
      cover: parsed.data.cover,
    });
  }, [parsed, band]);

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="font-display text-3xl text-ink">On-road price</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Adds a state registration estimate, an IRDAI insurance tier, and TCS
        when the ex-showroom price is above ₹10 lakh.
      </p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={(event) => event.preventDefault()}
      >
        <Field
          label="Ex-showroom price"
          error={parsed.success ? undefined : "Enter an ex-showroom price."}
        >
          <TextInput
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            {...register("exShowroom", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Registration state">
          <SelectInput {...register("stateId")}>
            {ROAD_TAX_STATES.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Vehicle">
          <SelectInput {...register("vehicleClass")}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </SelectInput>
        </Field>
        <Field label="Fuel">
          <SelectInput {...register("fuel")}>
            {fuels.map((fuel) => (
              <option key={fuel.value} value={fuel.value}>
                {fuel.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="IRDAI capacity class" hint="Third-party premium follows this band.">
          <SelectInput {...register("engineBand")}>
            {bands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Insurance tier">
          <SelectInput {...register("cover")}>
            <option value="third_party">Third party</option>
            <option value="comprehensive">Comprehensive</option>
          </SelectInput>
        </Field>
      </form>
      {quote ? <OnRoadResult quote={quote} cover={values.cover} /> : null}
    </section>
  );
}

function OnRoadResult({
  quote,
  cover,
}: {
  quote: ReturnType<typeof estimateOnRoad>;
  cover: InsuranceCover;
}) {
  const rateLabel = `${(quote.rtoRate * 100).toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  })}% in ${quote.stateName}`;

  return (
    <dl className="mt-6 rounded-2xl bg-paper px-4 py-2">
      <MoneyRow label="Ex-showroom" value={formatInr(quote.exShowroom)} />
      <MoneyRow label={`RTO registration (${rateLabel})`} value={formatInr(quote.rto)} />
      <MoneyRow
        label={
          cover === "comprehensive"
            ? "Insurance, comprehensive incl. GST"
            : "Insurance, third party incl. GST"
        }
        value={formatInr(quote.insurance)}
      />
      <p className="pb-2 text-xs text-muted">
        Third party {formatInr(quote.thirdParty)}
        {quote.ownDamage > 0
          ? ` · own damage ${formatInr(quote.ownDamage)} on IDV ${formatInr(quote.idv)}`
          : ""}
        {` · GST ${formatInr(quote.gst)}`}
      </p>
      <MoneyRow
        label={quote.tcs > 0 ? "TCS at 1%" : "TCS"}
        value={quote.tcs > 0 ? formatInr(quote.tcs) : "Not applied"}
      />
      <MoneyRow label="Estimated on-road" value={formatInr(quote.onRoad)} strong />
    </dl>
  );
}
