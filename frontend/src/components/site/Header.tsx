import { Link, usePage } from "@inertiajs/react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";

import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT, cn } from "@/lib/utils";
import type { SharedProps } from "@/types";

import { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";

// cmdk + its dialog are only fetched the first time the palette opens.
const CommandPalette = lazy(() => import("./CommandPalette"));

export default function Header() {
  const { auth, catalog } = usePage<SharedProps>().props;
  const url = usePage().url;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [url]);
  useEffect(() => {
    if (paletteOpen) setPaletteLoaded(true);
  }, [paletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || menuOpen ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="shell flex h-16 items-center gap-6 md:h-20">
          <Link href="/" aria-label="FileSaviour home" className="mr-auto md:mr-0">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="mx-auto hidden items-center gap-1 lg:flex">
            {catalog.categories.map((c) => (
              <Link
                key={c.slug}
                href={c.path}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-fg-muted transition hover:bg-surface-2 hover:text-fg",
                  url.startsWith(c.path) && "bg-surface-2 text-fg",
                )}
              >
                {c.short}
                <span className="ml-1.5 font-mono text-[0.7rem] text-fg-faint">{c.count}</span>
              </Link>
            ))}
            <Link href="/tools" className="rounded-full px-4 py-2 text-sm text-fg-muted transition hover:bg-surface-2 hover:text-fg">
              All tools
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-full border border-line pl-3.5 pr-2 text-sm text-fg-faint transition hover:border-line-strong hover:text-fg-muted sm:flex"
            >
              <Search className="size-4" aria-hidden />
              <span>Find a tool</span>
              <kbd className="ml-3 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[0.7rem]">⌘K</kbd>
            </button>
            <button type="button" onClick={() => setPaletteOpen(true)} aria-label="Search tools"
              className="grid size-10 place-items-center rounded-full border border-line sm:hidden">
              <Search className="size-4" />
            </button>
            <ThemeToggle />
            {auth.user ? (
              <Link href="/dashboard" className="hidden h-10 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg transition hover:opacity-90 md:flex">
                Dashboard
              </Link>
            ) : (
              <Link href="/account/login" className="hidden h-10 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg transition hover:opacity-90 md:flex">
                Log in
              </Link>
            )}
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-line lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <div className="shell grid gap-1 pb-6 pt-2">
                {catalog.categories.map((c) => (
                  <Link key={c.slug} href={c.path} className="flex items-center gap-3 border-b border-line py-4 font-display text-2xl">
                    <ToolIcon name={c.icon} className="size-5" />
                    <span className="flex-1">{c.name}</span>
                    <span className="font-mono text-sm text-fg-faint" style={{ color: CATEGORY_ACCENT[c.slug] }}>{c.count}</span>
                  </Link>
                ))}
                <Link href="/tools" className="flex items-center justify-between py-4 font-display text-2xl">
                  All 42 tools <ArrowUpRight className="size-5" />
                </Link>
                <Link href={auth.user ? "/dashboard" : "/account/login"}
                  className="mt-2 flex h-12 items-center justify-center rounded-full bg-fg font-medium text-bg">
                  {auth.user ? "Dashboard" : "Log in"}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </Suspense>
      )}
    </>
  );
}
