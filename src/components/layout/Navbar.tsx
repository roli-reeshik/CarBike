"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CalendarClock,
  ChevronDown,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  MAIN_NAV_ITEMS,
  type NavItem,
  type NavSubItem,
} from "@/config/navigation";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  TrendingUp,
  CalendarClock,
  MapPin,
  ShieldCheck,
  Tag,
};

function resolveIcon(name: string): LucideIcon {
  return NAV_ICONS[name] ?? Sparkles;
}

function isSectionCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const path = href.split("?")[0] ?? href;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isSubCurrent(pathname: string, search: string, href: string) {
  const [path, query = ""] = href.split("?");
  if (pathname !== path) return false;
  if (!query) return true;
  const expected = new URLSearchParams(query);
  const current = new URLSearchParams(search);
  for (const [key, value] of expected) {
    if (current.get(key) !== value) return false;
  }
  return true;
}

function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-[11px] font-semibold tracking-wide text-card">
        CK
      </span>
      <span className="text-xs font-semibold tracking-[0.18em] text-accent">
        CARBIKEKHARIDO
      </span>
    </Link>
  );
}

function SubItemLink({
  item,
  onNavigate,
}: {
  item: NavSubItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = isSubCurrent(pathname, searchParams.toString(), item.href);
  const Icon = resolveIcon(item.iconName);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn(
        "group/item flex items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-paper",
        current && "bg-paper",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition-colors duration-200 group-hover/item:bg-accent group-hover/item:text-white">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">{item.title}</span>
          {item.badge ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {item.badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function DesktopMenuItem({
  item,
  open,
  align = "start",
  onOpen,
  onClose,
}: {
  item: NavItem;
  open: boolean;
  align?: "start" | "end";
  onOpen: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const current = isSectionCurrent(pathname, item.href);
  const subItems = item.subItems ?? [];

  if (!item.hasDropdown || subItems.length === 0) {
    return (
      <Link
        href={item.href}
        aria-current={current ? "page" : undefined}
        className={cn(
          "border-b-2 py-5 text-sm font-medium transition-colors duration-200",
          current
            ? "border-accent text-ink"
            : "border-transparent text-muted hover:text-ink",
        )}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={(event) => {
        if (event.currentTarget.contains(document.activeElement)) return;
        onClose();
      }}
      onFocusCapture={onOpen}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onClose();
        }
      }}
    >
      <Link
        href={item.href}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        aria-current={current ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-1 border-b-2 py-5 text-sm font-medium transition-colors duration-200",
          current || open
            ? "border-accent text-ink"
            : "border-transparent text-muted hover:text-ink",
        )}
      >
        {item.title}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </Link>
      <div
        className={cn(
          "absolute top-full z-50 pt-2",
          align === "end" ? "right-0" : "left-0",
        )}
      >
        <AnimatePresence>
          {open ? (
            <motion.div
              id={panelId}
              role="region"
              aria-label={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="w-[22.5rem] rounded-2xl border border-line bg-white/95 p-2 shadow-[0_24px_60px_-28px_rgba(26,23,20,0.45)] backdrop-blur-md"
            >
              {subItems.map((subItem) => (
                <SubItemLink key={subItem.href} item={subItem} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    drawer?.querySelector<HTMLElement>("[data-close-drawer]")?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open ? (
      <motion.div
        key="mobile-overlay"
        aria-hidden
        className="fixed inset-0 z-[60] cursor-pointer bg-ink/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={onClose}
      />
      ) : null}
      {open ? (
      <motion.aside
        key="mobile-drawer"
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,22rem)] flex-col border-l border-line bg-white/95 shadow-[0_0_40px_-12px_rgba(26,23,20,0.45)] backdrop-blur-md"
        initial={reduceMotion ? false : { x: "100%" }}
        animate={{ x: 0 }}
        exit={reduceMotion ? undefined : { x: "100%" }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <BrandMark />
          <button
            type="button"
            data-close-drawer
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-paper"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Mobile">
          {MAIN_NAV_ITEMS.map((item) => {
            const current = isSectionCurrent(pathname, item.href);
            const subItems = item.subItems ?? [];
            const isOpen = expanded === item.title;

            if (!item.hasDropdown || subItems.length === 0) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center rounded-xl px-3 py-3.5 text-sm font-medium transition-colors duration-200",
                    current
                      ? "bg-ink text-card"
                      : "text-ink hover:bg-paper",
                  )}
                >
                  {item.title}
                </Link>
              );
            }

            return (
              <div key={item.title} className="border-b border-line/80 last:border-b-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setExpanded((value) => (value === item.title ? null : item.title))
                  }
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper"
                >
                  <span className={cn(current && "text-accent")}>{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key={`${item.title}-panel`}
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-2">
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="mx-3 mb-1 block rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-accent uppercase hover:bg-accent-soft"
                        >
                          View all {item.title.toLowerCase()}
                        </Link>
                        {subItems.map((subItem) => (
                          <SubItemLink
                            key={subItem.href}
                            item={subItem}
                            onNavigate={onClose}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </motion.aside>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const navRef = useRef<HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
          <nav
            ref={navRef}
            className="hidden items-center gap-6 lg:flex"
            aria-label="Primary"
          >
            {MAIN_NAV_ITEMS.map((item, index) => (
              <DesktopMenuItem
                key={item.title}
                item={item}
                align={index >= MAIN_NAV_ITEMS.length - 2 ? "end" : "start"}
                open={openMenu === item.title}
                onOpen={() => setOpenMenu(item.title)}
                onClose={() =>
                  setOpenMenu((current) => (current === item.title ? null : current))
                }
              />
            ))}
          </nav>
            <button
              type="button"
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-paper lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>
      {mounted ? (
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      ) : null}
    </>
  );
}
