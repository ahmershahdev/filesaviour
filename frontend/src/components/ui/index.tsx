import { Link } from "@inertiajs/react";
import { ArrowUpRight, Cloud, Monitor, Sparkles } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef, type ComponentProps, type ReactNode } from "react";

export { Checkbox, Field, PasswordField, TextArea, passwordScore } from "./form";

import { cn } from "@/lib/utils";
import type { Runtime } from "@/types";

type ButtonVariant = "primary" | "highlight" | "ghost";
const BUTTON: Record<ButtonVariant, string> = {
  primary: "bg-fg text-bg hover:opacity-90",
  highlight: "bg-highlight text-highlight-fg hover:brightness-105",
  ghost: "border border-line-strong text-fg hover:bg-surface-2",
};

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        BUTTON[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({ variant = "primary", className, href, children }: { variant?: ButtonVariant; className?: string; href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn("group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium transition active:scale-[0.98]", BUTTON[variant], className)}>
      {children}
      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

const RUNTIME = {
  browser: { label: "In browser", icon: Monitor, cls: "text-mint-400 border-mint-400/30 bg-mint-400/10" },
  server: { label: "Secure server", icon: Cloud, cls: "text-sky-400 border-sky-400/30 bg-sky-400/10" },
  ai: { label: "AI powered", icon: Sparkles, cls: "text-signal-500 border-signal-500/30 bg-signal-500/10" },
} as const;

export function RuntimeBadge({ runtime, className }: { runtime: Runtime; className?: string }) {
  const r = RUNTIME[runtime];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider", r.cls, className)}>
      <r.icon className="size-3" aria-hidden />
      {r.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "live") return null;
  return (
    <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-fg-faint">
      {status === "soon" ? "Soon" : "Beta"}
    </span>
  );
}

/** Line-by-line reveal for display headings. Text stays in the DOM for SEO/SSR. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ index, eyebrow, title, children, className }: { index?: string; eyebrow: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)}>
      <div className="md:col-span-8">
        <p className="eyebrow mb-5 flex items-center gap-3">
          {index && <span className="text-highlight">{index}</span>}
          <span className="h-px w-8 bg-line-strong" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="text-headline">{title}</h2>
      </div>
      {children && <div className="text-lede text-fg-muted md:col-span-4">{children}</div>}
    </div>
  );
}
