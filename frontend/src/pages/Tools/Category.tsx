import { usePage } from "@inertiajs/react";

import { ToolCard } from "@/components/tool/ToolCard";
import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT } from "@/lib/utils";
import type { CategorySlug, SharedProps } from "@/types";

export default function ToolsCategory({ category }: { category: CategorySlug }) {
  const { catalog } = usePage<SharedProps>().props;
  const cat = catalog.categories.find((c) => c.slug === category)!;
  const tools = catalog.tools.filter((t) => t.category === category);
  const accent = CATEGORY_ACCENT[category];

  return (
    <div className="shell pt-32 md:pt-40">
      <div className="grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow mb-5 flex items-center gap-2" style={{ color: accent }}>
            <ToolIcon name={cat.icon} className="size-4" /> {cat.count} tools
          </p>
          <h1 className="text-display">{cat.name}</h1>
        </div>
        <p className="text-lede text-fg-muted md:col-span-4">{cat.description} Free, no sign-up, works on any device.</p>
      </div>
      <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
      </div>
    </div>
  );
}
