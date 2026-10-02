import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "h-11 w-full rounded-xl border border-line bg-paper px-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-accent">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function SelectInput({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function MoneyRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-2",
        strong && "border-t border-line pt-3 text-base",
      )}
    >
      <dt className={strong ? "font-medium text-ink" : "text-muted"}>{label}</dt>
      <dd className={cn("font-medium text-ink", strong && "text-lg")}>{value}</dd>
    </div>
  );
}
