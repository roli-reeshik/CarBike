"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useComparisonStore } from "@/stores/useComparisonStore";
import { formatInr } from "@/lib/utils";

const rows = [
  {
    label: "Ex-showroom from",
    value: (item: { priceMin: number }) => formatInr(item.priceMin),
  },
  {
    label: "Ex-showroom to",
    value: (item: { priceMax: number }) => formatInr(item.priceMax),
  },
  {
    label: "Fuel",
    value: (item: { fuelTypes: string[] }) => item.fuelTypes.join(", "),
  },
  {
    label: "Transmission",
    value: (item: { transmissionTypes: string[] }) =>
      item.transmissionTypes.join(", "),
  },
  {
    label: "Power",
    value: (item: { powerBhp: string }) => item.powerBhp,
  },
  {
    label: "Torque",
    value: (item: { torqueNm: string }) => item.torqueNm,
  },
  {
    label: "ARAI mileage / range",
    value: (item: { mileageOrRange: string }) => item.mileageOrRange,
  },
  {
    label: "Seats or style",
    value: (item: { seatingCapacity: number | null; bikeStyle: string | null }) =>
      item.seatingCapacity
        ? `${item.seatingCapacity} seats`
        : (item.bikeStyle ?? "—"),
  },
] as const;

export function CompareBoard() {
  const items = useComparisonStore((state) => state.items);
  const remove = useComparisonStore((state) => state.remove);
  const clear = useComparisonStore((state) => state.clear);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const persistApi = useComparisonStore.persist;
    if (persistApi.hasHydrated()) setReady(true);
    return persistApi.onFinishHydration(() => setReady(true));
  }, []);

  if (!ready) {
    return <p className="text-sm text-muted">Loading your comparison…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-ink">Nothing in the tray yet.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Add up to three cars or bikes from a match. They stay on this device.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-card"
        >
          Find a vehicle
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-muted hover:text-ink"
        >
          Clear tray
        </button>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-line bg-card">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-40 p-4" />
              {items.map((item) => (
                <th key={item.id} className="min-w-52 p-4 align-top font-normal">
                  <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8f6f0] via-[#ece7dc] to-[#e4ded4] p-2 flex items-center justify-center">
                    <Image
                      src={item.heroImage}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                  <p className="text-xs text-muted">{item.brandName}</p>
                  <p className="font-display text-2xl leading-tight text-ink">
                    {item.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
                  >
                    <X className="size-4" aria-hidden />
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th className="p-4 text-sm font-medium text-muted">{row.label}</th>
                {items.map((item) => (
                  <td key={item.id} className="p-4 text-sm text-ink">
                    {row.value(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
