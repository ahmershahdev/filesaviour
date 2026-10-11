import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/components/ui";
import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT, cn } from "@/lib/utils";
import type { ToolCard as ToolCardType } from "@/types";

export function ToolCard({ tool, index, className }: { tool: ToolCardType; index?: number; className?: string }) {
  return (
    <Link
      href={tool.path}
      className={cn(
        "group relative flex min-h-56 flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-6 transition duration-500 hover:-translate-y-1 hover:border-line-strong hover:bg-surface-2",
        className,
      )}
      style={{ ["--tool-accent" as string]: CATEGORY_ACCENT[tool.category] }}
    >
      {/* Accent bloom that follows the category colour */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-0 blur-3xl transition duration-700 group-hover:opacity-25" style={{ background: "var(--tool-accent)" }} />
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl border border-line" style={{ color: "var(--tool-accent)" }}>
          <ToolIcon name={tool.icon} className="size-5" />
        </span>
        <span className="flex items-center gap-2">
          <StatusBadge status={tool.status} />
          {index !== undefined && <span className="font-mono text-xs text-fg-faint">{String(index + 1).padStart(2, "0")}</span>}
        </span>
      </div>
      <h3 className="mt-auto pt-10 font-display text-2xl tracking-tight">{tool.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{tool.summary}</p>
      <ArrowUpRight className="absolute bottom-6 right-6 size-5 translate-y-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" aria-hidden />
    </Link>
  );
}

/** Editorial index row used in category lists on the home page. */
export function ToolRow({ tool, index }: { tool: ToolCardType; index: number }) {
  return (
    <Link
      href={tool.path}
      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors hover:border-line-strong md:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:py-6"
    >
      <span className="font-mono text-xs text-fg-faint">{String(index + 1).padStart(2, "0")}</span>
      <span className="flex items-center gap-3 font-display text-xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
        {tool.name}
        <StatusBadge status={tool.status} />
      </span>
      <span className="hidden text-sm text-fg-muted md:block">{tool.summary}</span>
      <span className="grid size-10 place-items-center rounded-full border border-line transition group-hover:border-transparent group-hover:bg-highlight group-hover:text-highlight-fg">
        <ArrowUpRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}
