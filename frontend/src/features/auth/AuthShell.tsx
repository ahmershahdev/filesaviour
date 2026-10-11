import { Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Lock, ShieldCheck, Timer } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";

import { LogoMark, Wordmark } from "@/components/brand/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Flash from "@/components/layout/Flash";
import Seo from "@/components/seo/Seo";
import type { SharedProps } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
export const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

const CHIPS = [
  { label: "PDF", angle: 0, color: "var(--color-vault-500)" },
  { label: "JPG", angle: 72, color: "var(--color-sky-400)" },
  { label: "DOCX", angle: 144, color: "var(--color-vault-400)" },
  { label: "PNG", angle: 216, color: "var(--color-mint-400)" },
  { label: "AI", angle: 288, color: "var(--color-signal-500)" },
];

type Props = {
  step: string;
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  /** Display line on the brand panel; each auth page tells its own part of the story. */
  statement?: ReactNode;
};

/** Split-screen auth page: form on the left, an animated brand panel on the right (lg+). */
export default function AuthShell({ step, title, subtitle, children, statement }: Props) {
  const reduced = useReducedMotion();
  return (
    <>
      <Seo />
      <Flash />
      <main id="main" className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative flex min-w-0 flex-col px-5 py-5 sm:px-10 md:py-8 xl:px-16">
          {/* Mobile-only glow so small screens still get a bit of the brand atmosphere */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-vault-500)_22%,transparent),transparent)] lg:hidden" />

          <header className="relative flex items-center justify-between gap-4">
            <Link href="/" aria-label="FileSaviour home"><Wordmark /></Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="hidden h-10 items-center gap-2 rounded-full px-4 text-sm text-fg-muted transition hover:bg-surface-2 hover:text-fg sm:flex">
                <ArrowLeft className="size-4" aria-hidden />Back to site
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <motion.div
            className="relative mx-auto my-auto w-full max-w-[26rem] py-14"
            variants={stagger}
            initial={reduced ? false : "hidden"}
            animate="show"
          >
            <motion.p variants={rise} className="eyebrow mb-6 flex items-center gap-3">
              <span className="text-highlight">{step}</span>
              <span className="h-px w-10 bg-line-strong" aria-hidden />
              Secure account
            </motion.p>
            <motion.h1 variants={rise} className="font-display text-[clamp(2.4rem,1.6rem+3vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
              {title}
            </motion.h1>
            <motion.div variants={rise} className="mt-4 text-fg-muted">{subtitle}</motion.div>
            <motion.div variants={stagger} className="mt-10">{children}</motion.div>
          </motion.div>

          <footer className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-fg-faint">
            <span className="inline-flex items-center gap-2"><Lock className="size-3.5" aria-hidden />Encrypted in transit · No ads · No trackers</span>
            <span>
              <Link href="/privacy" className="hover:text-fg">Privacy</Link> · <Link href="/terms" className="hover:text-fg">Terms</Link>
            </span>
          </footer>
        </div>

        <BrandPanel statement={statement} reduced={!!reduced} />
      </main>
    </>
  );
}

function BrandPanel({ statement, reduced }: { statement?: ReactNode; reduced: boolean }) {
  const { catalog } = usePage<SharedProps>().props;
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  // Pointer spotlight: write CSS variables once per frame, never React state.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    });
  };

  const names = catalog.tools.filter((t) => t.status !== "soon").map((t) => t.name);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      aria-hidden
      className="relative hidden overflow-hidden border-l border-line bg-bg-raised [--mx:60%] [--my:40%] lg:sticky lg:top-0 lg:block lg:h-dvh"
    >
      {/* Blueprint grid, faded toward the edges */}
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]" />
      <div className="absolute inset-0 transition-[background] duration-300 [background:radial-gradient(28rem_circle_at_var(--mx)_var(--my),color-mix(in_oklab,var(--color-vault-500)_30%,transparent),transparent_70%)]" />

      {/* Orbit system */}
      <div className="absolute left-1/2 top-[38%] size-0 [--orbit:min(12rem,24vh)]">
        {[0.62, 1, 1.38].map((s, i) => (
          <span
            key={s}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-strong"
            style={{ width: `calc(var(--orbit) * ${s * 2})`, height: `calc(var(--orbit) * ${s * 2})`, borderStyle: i === 1 ? "dashed" : "solid", opacity: 1 - i * 0.25 }}
          />
        ))}
        <div className="absolute left-0 top-0 size-0 animate-[spin_48s_linear_infinite]">
          {CHIPS.map((c) => (
            <span key={c.label} className="absolute left-0 top-0" style={{ transform: `rotate(${c.angle}deg) translateX(var(--orbit)) rotate(${-c.angle}deg)` }}>
              <span className="block -translate-x-1/2 -translate-y-1/2 animate-[spin_48s_linear_infinite_reverse]">
                <span className="flex items-center gap-1.5 rounded-full border border-line-strong bg-bg/80 px-3 py-1.5 font-mono text-[0.7rem] tracking-wider shadow-lg backdrop-blur">
                  <span className="size-1.5 rounded-full" style={{ background: c.color }} />{c.label}
                </span>
              </span>
            </span>
          ))}
        </div>
        <span className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-signal-500)_45%,transparent),transparent_65%)] blur-2xl" />
        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
          <LogoMark className="block size-[calc(var(--orbit)*0.62)] animate-[float_7s_ease-in-out_infinite] drop-shadow-[0_30px_60px_rgba(45,107,255,0.45)]" />
        </div>
      </div>

      <div className="absolute right-10 top-10 grid gap-3 text-right">
        {[
          { icon: ShieldCheck, text: "Browser tools never upload" },
          { icon: Timer, text: "Server files deleted ≤ 1 h" },
        ].map((b) => (
          <span key={b.text} className="ml-auto inline-flex items-center gap-2 rounded-full border border-line bg-bg/60 px-3.5 py-1.5 text-xs text-fg-muted backdrop-blur">
            <b.icon className="size-3.5 text-highlight" />{b.text}
          </span>
        ))}
      </div>

      <p className="absolute bottom-20 left-10 right-10 font-display text-[clamp(2.5rem,min(1rem+3vw,7vh),4.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
        {statement ?? <>Your files.<br /><span className="serif-em font-normal text-highlight">Kept safe,</span><br />kept simple.</>}
      </p>

      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-line py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-fg-faint">
          {[...names, ...names].map((n, i) => (
            <span key={i} className="flex items-center gap-8">{n}<span className="size-1 rounded-full bg-highlight/60" /></span>
          ))}
        </div>
      </div>
    </div>
  );
}
