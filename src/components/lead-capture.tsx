"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Bell, CarFront } from "lucide-react";
import type { LaunchStatusName } from "@/lib/requirements";
import { cn } from "@/lib/utils";

type LeadForm = {
  userName: string;
  phone: string;
  city: string;
};

export function LeadCapture({
  vehicleId,
  vehicleName,
  launchStatus,
  variantId,
  variantName,
  cities,
}: {
  vehicleId: string;
  vehicleName: string;
  launchStatus: LaunchStatusName;
  variantId?: string;
  variantName?: string;
  cities: string[];
}) {
  const upcoming = launchStatus !== "LAUNCHED";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadForm>({
    defaultValues: { userName: "", phone: "", city: cities[0] ?? "" },
  });

  function open() {
    setDone(false);
    setServerError(null);
    reset({ userName: "", phone: "", city: cities[0] ?? "" });
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function onSubmit(values: LeadForm) {
    setServerError(null);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: values.userName,
        phone: values.phone,
        city: values.city,
        vehicleId,
        variantId: variantId || null,
        leadType: upcoming ? "LAUNCH_ALERT" : "TEST_DRIVE",
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      fieldErrors?: Partial<Record<keyof LeadForm, string[]>>;
    } | null;

    if (!response.ok) {
      const fields = payload?.fieldErrors;
      if (fields?.userName?.[0]) setError("userName", { message: fields.userName[0] });
      if (fields?.phone?.[0]) setError("phone", { message: fields.phone[0] });
      if (fields?.city?.[0]) setError("city", { message: fields.city[0] });
      setServerError(payload?.error ?? "The request could not be saved.");
      return;
    }

    setDone(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium",
          upcoming
            ? "bg-accent text-white"
            : "border border-line bg-paper text-ink hover:border-ink/30",
        )}
      >
        {upcoming ? (
          <Bell className="size-4" aria-hidden />
        ) : (
          <CarFront className="size-4" aria-hidden />
        )}
        {upcoming ? "Alert Me on Launch" : "Book Test Drive"}
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(100%-1.5rem,28rem)] rounded-3xl border border-line bg-card p-0 text-ink backdrop:bg-ink/45"
        aria-labelledby="lead-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <form
          className="p-6"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 id="lead-title" className="font-display text-3xl text-ink">
            {upcoming ? "Alert me on launch" : "Book a test drive"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {upcoming
              ? `We'll call this number when ${vehicleName} has a launch update.`
              : `A dealer will call to fix a test drive for ${vehicleName}.`}
            {variantName ? ` Trim: ${variantName}.` : ""}
          </p>

          {done ? (
            <p className="mt-5 rounded-2xl bg-good-soft px-4 py-3 text-sm text-good" role="status">
              Saved. We&apos;ll use this mobile number for {valuesCityNote(upcoming)}.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Name</span>
                <input
                  className={inputClass}
                  autoComplete="name"
                  {...register("userName", {
                    required: "Enter your name.",
                    minLength: { value: 2, message: "Enter your name." },
                  })}
                />
                {errors.userName ? (
                  <span className="text-xs text-accent">{errors.userName.message}</span>
                ) : null}
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Mobile number</span>
                <input
                  className={inputClass}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  {...register("phone", {
                    required: "Enter a 10-digit Indian mobile number.",
                  })}
                />
                {errors.phone ? (
                  <span className="text-xs text-accent">{errors.phone.message}</span>
                ) : null}
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">City</span>
                <input
                  className={inputClass}
                  list="lead-cities"
                  autoComplete="address-level2"
                  {...register("city", {
                    required: "Enter a city.",
                    minLength: { value: 2, message: "Enter a city." },
                  })}
                />
                <datalist id="lead-cities">
                  {cities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {errors.city ? (
                  <span className="text-xs text-accent">{errors.city.message}</span>
                ) : null}
              </label>
              {serverError ? (
                <p className="text-sm text-accent" role="alert">
                  {serverError}
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink"
            >
              {done ? "Close" : "Cancel"}
            </button>
            {done ? null : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-card disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : upcoming ? "Alert me" : "Request test drive"}
              </button>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-paper px-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent";

function valuesCityNote(upcoming: boolean) {
  return upcoming ? "the launch alert" : "the test-drive request";
}
