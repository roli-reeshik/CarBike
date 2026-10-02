"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  COMPARISON_LIMIT,
  useComparisonStore,
} from "@/stores/useComparisonStore";

export function ComparisonDock() {
  const items = useComparisonStore((state) => state.items);
  const remove = useComparisonStore((state) => state.remove);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const persistApi = useComparisonStore.persist;
    if (persistApi.hasHydrated()) setReady(true);
    return persistApi.onFinishHydration(() => setReady(true));
  }, []);

  const open = ready && items.length > 0;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <div className="h-28" />
          <motion.aside
            initial={reduceMotion ? false : { y: 96 }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: 96 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 shadow-[0_-16px_40px_-28px_rgba(26,23,20,0.7)] backdrop-blur"
          >
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <p className="hidden shrink-0 text-sm font-medium text-ink sm:block">
                {items.length} of {COMPARISON_LIMIT}
              </p>
              <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper py-1 pr-2 pl-1"
                  >
                    <Image
                      src={item.heroImage}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover"
                    />
                    <span className="max-w-36 truncate text-sm text-ink">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name} from comparison`}
                      className="rounded-full p-1 text-muted hover:text-ink"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                href="/compare"
                className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white"
              >
                Compare Now
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
