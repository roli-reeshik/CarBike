"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { calculateEmi } from "@/lib/calculators";
import { formatInr } from "@/lib/utils";
import { Field, MoneyRow, TextInput } from "@/components/calculators/fields";

const schema = z.object({
  principal: z.number().positive(),
  annualPercent: z.number().min(0).max(36),
  months: z.number().int().min(1).max(360),
});

type FormValues = z.infer<typeof schema>;

export function EmiCalculator() {
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      principal: 600000,
      annualPercent: 9.5,
      months: 60,
    },
  });
  const values = watch();
  const parsed = schema.safeParse({
    principal: Number(values.principal),
    annualPercent: Number(values.annualPercent),
    months: Number(values.months),
  });
  const quote = useMemo(
    () =>
      parsed.success
        ? calculateEmi(
            parsed.data.principal,
            parsed.data.annualPercent,
            parsed.data.months,
          )
        : null,
    [parsed],
  );
  const interestShare =
    quote && quote.totalPayment > 0
      ? (quote.totalInterest / quote.totalPayment) * 100
      : 0;

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <h2 className="font-display text-3xl text-ink">Loan EMI</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Standard reducing-balance EMI. Interest is charged each month on the
        outstanding principal.
      </p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-3"
        noValidate
        onSubmit={(event) => event.preventDefault()}
      >
        <Field label="Principal" error={fieldError(parsed, "principal")}>
          <TextInput
            type="number"
            min={1}
            step={1000}
            inputMode="numeric"
            {...register("principal", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Annual interest %" error={fieldError(parsed, "annualPercent")}>
          <TextInput
            type="number"
            min={0}
            max={36}
            step={0.1}
            inputMode="decimal"
            {...register("annualPercent", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Tenure in months" error={fieldError(parsed, "months")}>
          <TextInput
            type="number"
            min={1}
            max={360}
            step={1}
            inputMode="numeric"
            {...register("months", { valueAsNumber: true })}
          />
        </Field>
      </form>
      {quote ? (
        <div className="mt-6">
          <dl className="rounded-2xl bg-paper px-4 py-2">
            <MoneyRow label="Monthly EMI" value={formatInr(quote.emi)} strong />
            <MoneyRow label="Principal" value={formatInr(quote.principal)} />
            <MoneyRow label="Total interest" value={formatInr(quote.totalInterest)} />
            <MoneyRow label="Total payable" value={formatInr(quote.totalPayment)} />
          </dl>
          <div className="mt-4" aria-hidden>
            <div className="flex h-3 overflow-hidden rounded-full bg-accent">
              <div
                className="bg-ink"
                style={{ width: `${100 - interestShare}%` }}
              />
            </div>
            <p className="mt-2 flex justify-between text-xs text-muted">
              <span>Principal {Math.round(100 - interestShare)}%</span>
              <span>Interest {Math.round(interestShare)}%</span>
            </p>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <caption className="mb-2 text-left text-xs font-medium tracking-wide text-muted uppercase">
                Yearly principal and interest
              </caption>
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-2 font-medium">Year</th>
                  <th className="py-2 font-medium">Principal</th>
                  <th className="py-2 font-medium">Interest</th>
                  <th className="py-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {quote.years.map((year) => (
                  <tr key={year.year} className="border-t border-line">
                    <td className="py-2">{year.year}</td>
                    <td className="py-2">{formatInr(year.principal)}</td>
                    <td className="py-2">{formatInr(year.interest)}</td>
                    <td className="py-2">{formatInr(year.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function fieldError(
  parsed: { success: boolean; error?: z.ZodError },
  key: keyof FormValues,
) {
  if (parsed.success || !parsed.error) return undefined;
  return parsed.error.issues.some((issue) => issue.path[0] === key)
    ? "Check this value."
    : undefined;
}
