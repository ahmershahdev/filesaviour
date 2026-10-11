import { router, usePage } from "@inertiajs/react";
import { Command } from "cmdk";
import { CornerDownLeft, Search } from "lucide-react";
import { useState } from "react";

import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT } from "@/lib/utils";
import type { SharedProps } from "@/types";

const PAGES = [
  { name: "All tools", path: "/tools" },
  { name: "FAQ", path: "/faq" },
  { name: "Blog", path: "/blog" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms" },
];

/** Jump to any of the 42 tools. Lazy-loaded by Header on first open (⌘K / Ctrl+K / "/"). */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { catalog } = usePage<SharedProps>().props;
  const [query, setQuery] = useState("");


  const go = (path: string) => {
    onOpenChange(false);
    setQuery("");
    router.visit(path);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search tools"
      overlayClassName="fixed inset-0 z-[90] bg-ink-950/60 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[12vh] z-[91] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-line-strong bg-bg-raised shadow-2xl shadow-black/40"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="size-4 text-fg-faint" aria-hidden />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search 42 tools… try “compress” or “pdf to word”"
          className="h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-faint"
        />
        <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-fg-faint">esc</kbd>
      </div>
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="px-4 py-10 text-center text-fg-muted">
          No tool matches “{query}”. <button className="underline" onClick={() => go("/contact")}>Suggest it?</button>
        </Command.Empty>
        {catalog.categories.map((cat) => (
          <Command.Group key={cat.slug} heading={cat.name}
            className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3">
            {catalog.tools.filter((t) => t.category === cat.slug).map((t) => (
              <Command.Item
                key={t.slug}
                value={`${t.name} ${t.slug.replace(/-/g, " ")} ${cat.short}`}
                onSelect={() => go(t.path)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-fg-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg"
              >
                <span className="grid size-8 place-items-center rounded-lg border border-line" style={{ color: CATEGORY_ACCENT[t.category] }}>
                  <ToolIcon name={t.icon} className="size-4" />
                </span>
                <span className="flex-1 truncate">{t.name}</span>
                {t.status !== "live" && <span className="font-mono text-[0.65rem] uppercase text-fg-faint">{t.status}</span>}
                <CornerDownLeft className="size-3.5 opacity-0 group-data-[selected=true]:opacity-60" aria-hidden />
              </Command.Item>
            ))}
          </Command.Group>
        ))}
        <Command.Group heading="Pages" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3">
          {PAGES.map((p) => (
            <Command.Item key={p.path} value={p.name} onSelect={() => go(p.path)}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-fg-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg">
              {p.name}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
