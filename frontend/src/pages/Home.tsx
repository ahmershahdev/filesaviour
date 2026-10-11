import { Link, usePage } from "@inertiajs/react";
import { ArrowDown, Cloud, Monitor, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import SmartDrop from "@/components/tool/SmartDrop";
import { ToolCard, ToolRow } from "@/components/tool/ToolCard";
import { ButtonLink, Reveal, SectionHeading } from "@/components/ui";
import HeroVisual from "@/components/webgl/Hero";
import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT } from "@/lib/utils";
import type { SharedProps, ToolCard as ToolCardType } from "@/types";

const FORMATS = ["PDF", "DOCX", "JPG", "PNG", "WEBP", "HEIC", "GIF", "PPTX", "XLSX", "HTML", "AVIF", "TXT", "ODT", "RTF", "CSV", "TIFF"];

export default function Home({ featured }: { featured: ToolCardType[] }) {
  const { catalog } = usePage<SharedProps>().props;
  const runtimeCount = (r: string) => catalog.tools.filter((t) => t.runtime === r).length;

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24">
        <HeroVisual />
        {/* Scrim keeps the copy legible over the scene, strongest on small screens */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-2/3 bg-gradient-to-t from-bg via-bg/80 to-transparent md:h-1/2 md:via-bg/40" />
        <div className="shell relative z-10 mt-auto grid gap-10 pb-10 md:pb-14">
          <p className="eyebrow flex items-center gap-3 animate-rise">
            <span className="size-1.5 rounded-full bg-highlight" aria-hidden />
            42 free tools · PDF · Image · AI · Utility
          </p>
          <h1 className="text-mega font-bold">
            <span className="block animate-rise [animation-delay:80ms]">Every file,</span>
            <span className="block animate-rise [animation-delay:180ms]">
              <span className="serif-em font-normal text-highlight">saved.</span>
            </span>
          </h1>
          <div className="grid items-end gap-8 md:grid-cols-12">
            <p className="text-lede max-w-xl text-fg-muted animate-rise [animation-delay:280ms] md:col-span-6">
              Merge, compress, convert, sign and rewrite, all in one calm place. Most tools run right in your
              browser, so your files never leave your device.
            </p>
            <div className="animate-rise [animation-delay:380ms] md:col-span-6 md:justify-self-end">
              <SmartDrop />
            </div>
          </div>
        </div>
        <div className="shell relative z-10 flex items-center justify-between border-t border-line py-4 text-sm text-fg-faint">
          <span>Save time. Save files. Save your sanity.</span>
          <a href="#rooms" className="inline-flex items-center gap-2 hover:text-fg">Explore <ArrowDown className="size-4" aria-hidden /></a>
        </div>
      </section>

      {/* -------------------------------------------------------- MARQUEE */}
      <section aria-label="Supported formats" className="overflow-hidden border-b border-line py-8">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-[clamp(3rem,8vw,7rem)] font-bold leading-none tracking-tight">
          {[...FORMATS, ...FORMATS].map((f, i) => (
            <span key={i} className={i % 4 === 1 ? "text-highlight" : "outline-type"} aria-hidden={i >= FORMATS.length}>{f}</span>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ FEATURED */}
      <section className="shell py-28 md:py-40">
        <SectionHeading index="01" eyebrow="Most used" title={<>The tools people <span className="serif-em">reach for</span> first.</>}>
          Six tools cover most everyday file jobs. Open one and start. No sign-up, no installs.
        </SectionHeading>
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t, i) => (
            <Reveal key={t.slug} delay={i * 0.06}><ToolCard tool={t} className="h-full" /></Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------- CATEGORY ROOMS */}
      <section id="rooms" className="border-t border-line">
        {catalog.categories.map((cat, ci) => (
          <CategoryRoom key={cat.slug} index={ci} />
        ))}
      </section>

      {/* ----------------------------------------------------- PRIVACY */}
      <section className="shell py-28 md:py-40">
        <SectionHeading index="03" eyebrow="Privacy by architecture" title={<>Your file stays <span className="serif-em">yours</span>.</>}>
          We don't just promise privacy. Each tool runs in the most private place that can do the job.
        </SectionHeading>
        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {[
            { icon: Monitor, n: runtimeCount("browser"), title: "In your browser", body: "Processed on your device with WebAssembly and Canvas. The file is never uploaded.", color: "var(--color-mint-400)" },
            { icon: Cloud, n: runtimeCount("server"), title: "Isolated servers", body: "Sent over TLS to sandboxed workers with no internet access, then deleted within an hour.", color: "var(--color-sky-400)" },
            { icon: Sparkles, n: runtimeCount("ai"), title: "AI, no training", body: "Text goes to our AI provider under terms that forbid training on it, then it's deleted.", color: "var(--color-signal-500)" },
          ].map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <div className="card flex h-full flex-col p-8">
                <r.icon className="size-6" style={{ color: r.color }} aria-hidden />
                <p className="mt-16 font-display text-7xl font-bold tracking-tight" style={{ color: r.color }}>{r.n}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-fg-faint">tools</p>
                <h3 className="mt-6 text-2xl">{r.title}</h3>
                <p className="mt-2 text-fg-muted">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        {/* Proportion bar: the same numbers as a single visual */}
        <div className="mt-6 flex h-3 overflow-hidden rounded-full" role="img" aria-label="Share of tools by where they run">
          <span style={{ flex: runtimeCount("browser"), background: "var(--color-mint-400)" }} />
          <span style={{ flex: runtimeCount("server"), background: "var(--color-sky-400)" }} />
          <span style={{ flex: runtimeCount("ai"), background: "var(--color-signal-500)" }} />
        </div>
      </section>

      {/* --------------------------------------------------------- STEPS */}
      <section className="border-y border-line bg-bg-raised">
        <div className="shell grid gap-12 py-28 md:grid-cols-12 md:py-40">
          <div className="md:col-span-5">
            <p className="eyebrow mb-5"><span className="text-highlight">04</span> — How it works</p>
            <h2 className="text-headline">Three steps.<br /><span className="serif-em text-fg-muted">That's the whole manual.</span></h2>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:col-span-7">
            {[
              ["Drop", "Drag a file anywhere on the page, or paste text. Batch tools take up to 20 files."],
              ["Tune", "Pick quality, size, pages or tone. Previews update live, so you see the result first."],
              ["Save", "Download instantly. Server copies are deleted within an hour, or right away if you ask."],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[4rem_1fr] gap-4 bg-bg-raised p-8">
                <span className="font-mono text-sm text-highlight">0{i + 1}</span>
                <div><h3 className="text-3xl">{t}</h3><p className="mt-2 text-fg-muted">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- CTA */}
      <section className="shell py-28 text-center md:py-40">
        <Reveal>
          <h2 className="text-display mx-auto max-w-5xl">Stop fighting your files<span className="serif-em text-highlight">.</span></h2>
          <p className="text-lede mx-auto mt-6 max-w-xl text-fg-muted">42 tools, one search away. Press <kbd className="rounded-md border border-line px-1.5 font-mono text-sm">⌘K</kbd> on any page.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tools" variant="highlight">Browse all tools</ButtonLink>
            <ButtonLink href="/account/register" variant="ghost">Create a free account</ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function CategoryRoom({ index }: { index: number }) {
  const { catalog } = usePage<SharedProps>().props;
  const cat = catalog.categories[index];
  const tools = catalog.tools.filter((t) => t.category === cat.slug);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);

  return (
    <div ref={ref} className="shell grid gap-10 border-b border-line py-20 md:grid-cols-12 md:py-28">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-28">
          <p className="eyebrow mb-5"><span className="text-highlight">02.{index + 1}</span> — {cat.short}</p>
          <h2 className="text-headline">{cat.name}</h2>
          <p className="mt-4 max-w-sm text-fg-muted">{cat.description}</p>
          <motion.div style={{ y, color: CATEGORY_ACCENT[cat.slug] }} className="mt-10 flex items-end gap-4">
            <span className="font-display text-[clamp(5rem,12vw,10rem)] font-bold leading-[0.8] tracking-tighter">{cat.count}</span>
            <ToolIcon name={cat.icon} className="mb-3 size-10" strokeWidth={1.2} />
          </motion.div>
          <Link href={cat.path} className="mt-8 inline-flex text-sm underline decoration-highlight underline-offset-4">All {cat.name.toLowerCase()}</Link>
        </div>
      </div>
      <div className="md:col-span-8">
        {tools.map((t, i) => <ToolRow key={t.slug} tool={t} index={i} />)}
      </div>
    </div>
  );
}
