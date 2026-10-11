import { usePage } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { ToolCard } from "@/components/tool/ToolCard";
import { cn } from "@/lib/utils";
import type { CategorySlug, SharedProps } from "@/types";

export default function ToolsIndex({ query = "" }: { query?: string }) {
  const { catalog } = usePage<SharedProps>().props;
  const [q, setQ] = useState(query);
  const [cat, setCat] = useState<CategorySlug | "all">("all");
  const dq = useDeferredValue(q.trim().toLowerCase());

  const tools = useMemo(
    () =>
      catalog.tools.filter(
        (t) =>
          (cat === "all" || t.category === cat) &&
          (!dq || `${t.name} ${t.summary} ${t.slug}`.toLowerCase().includes(dq)),
      ),
    [catalog.tools, cat, dq],
  );

  return (
    <div className="shell pt-32 md:pt-40">
      <p className="eyebrow mb-5">The full toolkit</p>
      <h1 className="text-display">
        42 tools<span className="serif-em text-fg-muted">, one place.</span>
      </h1>

      <div className="sticky top-16 z-30 -mx-4 mt-12 border-b border-line bg-bg/80 px-4 py-4 backdrop-blur-xl md:top-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search tools</span>
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-faint" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search tools…"
              className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 outline-none focus:border-accent" />
          </label>
          <div role="tablist" aria-label="Filter by category" className="flex gap-1 overflow-x-auto rounded-full border border-line p-1">
            {[{ slug: "all" as const, short: "All", count: catalog.tools.length }, ...catalog.categories].map((c) => (
              <button key={c.slug} role="tab" aria-selected={cat === c.slug} onClick={() => setCat(c.slug)}
                className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm transition", cat === c.slug ? "bg-fg text-bg" : "text-fg-muted hover:text-fg")}>
                {c.short} <span className="font-mono text-xs opacity-60">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{tools.length} tools shown</p>
      {tools.length ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
        </div>
      ) : (
        <p className="py-24 text-center text-lede text-fg-muted">Nothing matches “{q}”. Try a format like “pdf” or “webp”.</p>
      )}
    </div>
  );
}
