import { Link, usePage } from "@inertiajs/react";
import { ChevronRight, Info, Plus } from "lucide-react";
import { Suspense } from "react";

import { ToolCard } from "@/features/tools/components/ToolCard";
import { workspaceFor } from "@/features/tools/workspaces";
import { RuntimeBadge, StatusBadge } from "@/components/ui";
import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT } from "@/lib/utils";
import type { SharedProps, Tool, ToolCard as ToolCardType } from "@/types";

type Props = {
  tool: Tool;
  steps: { name: string; text: string }[];
  faqs: { q: string; a: string }[];
  runtimeCopy: string;
  related: ToolCardType[];
};

export default function ToolShow({ tool, steps, faqs, runtimeCopy, related }: Props) {
  const { catalog } = usePage<SharedProps>().props;
  const category = catalog.categories.find((c) => c.slug === tool.category)!;
  const Workspace = workspaceFor(tool);
  const accent = CATEGORY_ACCENT[tool.category];
  const inputs = tool.accepts.filter((a) => a.startsWith(".")).map((a) => a.slice(1).toUpperCase());

  return (
    <article className="relative overflow-x-clip" style={{ ["--tool-accent" as string]: accent }}>
      {/* --------------------------------------------------------- HEAD */}
      <header className="relative pt-28 md:pt-36">
        <span aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]" style={{ background: accent }} />
        <div className="shell relative">
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-faint">
              <li><Link href="/" className="hover:text-fg">Home</Link></li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li><Link href="/tools" className="hover:text-fg">Tools</Link></li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li><Link href={category.path} className="hover:text-fg">{category.name}</Link></li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li aria-current="page" className="text-fg-muted">{tool.name}</li>
            </ol>
          </nav>
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="grid size-11 place-items-center rounded-2xl border border-line" style={{ color: accent }}>
                  <ToolIcon name={tool.icon} className="size-5" />
                </span>
                <RuntimeBadge runtime={tool.runtime} />
                <StatusBadge status={tool.status} />
              </div>
              <h1 className="text-display">{tool.name}</h1>
            </div>
            <p className="text-lede text-fg-muted md:col-span-4">{tool.summary}</p>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- WORKSPACE */}
      <section id="workspace" aria-label={`${tool.name} workspace`} className="shell mt-12 md:mt-16">
        {tool.notice && (
          <p className="mb-4 flex items-start gap-3 rounded-2xl border border-signal-500/30 bg-signal-500/10 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-signal-500" aria-hidden />{tool.notice}
          </p>
        )}
        <Suspense fallback={<div className="card min-h-72 animate-pulse" />}>
          <Workspace tool={tool} />
        </Suspense>
        <p className="mt-4 flex items-center gap-2 text-sm text-fg-faint">
          <span className="size-1.5 rounded-full" style={{ background: accent }} aria-hidden />
          {runtimeCopy}
        </p>
      </section>

      {/* ---------------------------------------------- ABOUT + HOW TO */}
      <section className="shell mt-28 grid gap-16 md:mt-40 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow mb-5">About this tool</p>
          <h2 className="text-headline">What {tool.name} <span className="serif-em">does</span></h2>
          <p className="mt-6 text-lg leading-relaxed text-fg-muted">{tool.intro}</p>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
            <div className="bg-bg p-4"><dt className="eyebrow">Input</dt><dd className="mt-1">{inputs.length ? inputs.join(", ") : "Text"}</dd></div>
            <div className="bg-bg p-4"><dt className="eyebrow">Output</dt><dd className="mt-1">{tool.output}</dd></div>
            <div className="bg-bg p-4"><dt className="eyebrow">Batch</dt><dd className="mt-1">{tool.batch ? "Up to 20 files" : "One file"}</dd></div>
            <div className="bg-bg p-4"><dt className="eyebrow">Price</dt><dd className="mt-1">Free</dd></div>
          </dl>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <h2 className="eyebrow mb-6">How to use {tool.name}</h2>
          <ol className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line">
            {steps.map((s, i) => (
              <li key={s.name} id={`step-${i + 1}`} className="grid grid-cols-[3.5rem_1fr] bg-bg p-6">
                <span className="font-mono text-sm" style={{ color: accent }}>0{i + 1}</span>
                <div><h3 className="text-xl">{s.name}</h3><p className="mt-1 text-fg-muted">{s.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------- FAQ */}
      <section className="shell mt-28 grid gap-10 md:mt-40 md:grid-cols-12">
        <h2 className="text-headline md:col-span-4">Questions<span className="serif-em text-fg-muted">, answered</span></h2>
        <div className="md:col-span-8">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-line py-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-medium">
                {f.q}
                <Plus className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="mt-4 max-w-2xl text-fg-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ RELATED */}
      {related.length > 0 && (
        <section className="shell mt-28 md:mt-40">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="text-headline">Pairs well with</h2>
            <Link href={category.path} className="hidden text-sm underline decoration-highlight underline-offset-4 md:block">All {category.name.toLowerCase()}</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => <ToolCard key={t.slug} tool={t} />)}
          </div>
        </section>
      )}
    </article>
  );
}
