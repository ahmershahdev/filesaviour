import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";

import { Wordmark } from "./Logo";
import Seo from "./Seo";

/** Split-screen shell: form on the left, brand statement on the right. */
export default function AuthShell({ title, subtitle, children }: { title: ReactNode; subtitle: ReactNode; children: ReactNode }) {
  return (
    <>
      <Seo />
      <main id="main" className="grid min-h-dvh lg:grid-cols-2">
        <div className="flex flex-col p-6 md:p-12">
          <Link href="/" aria-label="FileSaviour home"><Wordmark /></Link>
          <div className="my-auto w-full max-w-md py-16">
            <h1 className="text-headline">{title}</h1>
            <p className="mt-3 text-fg-muted">{subtitle}</p>
            <div className="mt-10">{children}</div>
          </div>
        </div>
        <div aria-hidden className="relative hidden overflow-hidden border-l border-line bg-bg-raised lg:block">
          <div className="absolute inset-0 grid place-items-center">
            {[22, 34, 46, 58].map((s, i) => (
              <span key={s} className="absolute rounded-full border border-line animate-spin-slow" style={{ width: `${s}rem`, height: `${s}rem`, borderStyle: i % 2 ? "dashed" : "solid", animationDuration: `${30 + i * 12}s` }} />
            ))}
            <span className="size-40 rounded-full bg-[radial-gradient(circle,var(--color-signal-500),transparent_70%)] opacity-60 blur-xl" />
          </div>
          <p className="absolute bottom-12 left-12 right-12 font-display text-5xl font-semibold leading-[0.95] tracking-tight">
            Your files.<br /><span className="serif-em font-normal text-highlight">Kept safe,</span><br />kept simple.
          </p>
        </div>
      </main>
    </>
  );
}
