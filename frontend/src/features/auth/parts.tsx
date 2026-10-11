import { Link } from "@inertiajs/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui";

import { rise } from "./AuthShell";

/** One staggered row of an auth form. */
export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div variants={rise} className={className}>{children}</motion.div>;
}

export function Submit({ busy, children, busyText }: { busy: boolean; children: ReactNode; busyText: string }) {
  return (
    <Button type="submit" variant="highlight" disabled={busy} className="group h-13 w-full text-base">
      {busy ? (
        <><LoaderCircle className="size-4 animate-spin" aria-hidden />{busyText}</>
      ) : (
        <>{children}<ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden /></>
      )}
    </Button>
  );
}

/** "or" divider followed by a secondary route (sign up ↔ log in). */
export function AltRoute({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <Row className="mt-8">
      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-fg-faint">
        <span className="h-px flex-1 bg-line" />{prompt}<span className="h-px flex-1 bg-line" />
      </div>
      <Link href={href} className="mt-5 flex h-13 items-center justify-center rounded-full border border-line-strong text-[0.95rem] font-medium transition hover:border-fg hover:bg-surface-2">
        {label}
      </Link>
    </Row>
  );
}
