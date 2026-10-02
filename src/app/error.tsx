"use client";

export default function HomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-accent">
        CARBIKEKHARIDO
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">
        The catalogue is offline.
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">
        PostgreSQL rejected the login in DATABASE_URL, so the matcher has no
        vehicles to filter. Update the password, apply the schema, and seed
        the catalogue.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-card"
      >
        Try again
      </button>
    </main>
  );
}
