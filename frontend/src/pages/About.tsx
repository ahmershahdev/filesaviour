import { usePage } from "@inertiajs/react";

import { ButtonLink, Reveal } from "@/components/ui";
import type { SharedProps } from "@/types";

const PRINCIPLES = [
  ["Local first", "If a browser can do the job, the browser does it. Uploading a file should be the exception."],
  ["Delete by default", "Server copies expire in an hour. You don't have to remember to clean up after yourself."],
  ["No dark patterns", "No fake countdowns, no surprise watermarks, no “upgrade to download” after the work is done."],
  ["Honest AI", "Detectors show probabilities, not verdicts. Rewriters improve your own drafts; they don't disguise other people's work."],
];

export default function About() {
  const { catalog } = usePage<SharedProps>().props;
  const local = catalog.tools.filter((t) => t.runtime === "browser").length;
  return (
    <div className="pt-32 md:pt-40">
      <div className="shell">
        <p className="eyebrow mb-5">About FileSaviour</p>
        <h1 className="text-display max-w-6xl">
          File tools shouldn't feel like a <span className="serif-em text-highlight">rescue mission</span>.
        </h1>
        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <p className="text-lede text-fg-muted md:col-span-6 md:col-start-7">
            FileSaviour is an independent project by Syed Ahmer Shah. It started with a simple frustration: merging two
            PDFs or shrinking a photo meant ad-filled sites, forced sign-ups and files uploaded to who-knows-where. So
            we built the opposite: 42 tools, {local} of which never upload anything, with a design that respects your time.
          </p>
        </div>
      </div>

      <section className="shell mt-28 md:mt-40">
        <h2 className="eyebrow mb-10">What we hold ourselves to</h2>
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-2">
          {PRINCIPLES.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.05} className="bg-bg p-8 md:p-12">
              <span className="font-mono text-sm text-highlight">0{i + 1}</span>
              <h3 className="mt-8 text-3xl">{t}</h3>
              <p className="mt-3 max-w-md text-fg-muted">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell mt-28 grid gap-6 md:mt-40 md:grid-cols-4">
        {[["42", "tools"], [String(local), "run in your browser"], ["1 h", "maximum file lifetime"], ["0", "files used for AI training"]].map(([n, l]) => (
          <div key={l} className="border-t border-line-strong pt-6">
            <p className="font-display text-6xl font-bold tracking-tight">{n}</p>
            <p className="mt-2 text-fg-muted">{l}</p>
          </div>
        ))}
      </section>

      <div className="shell mt-28 flex flex-wrap gap-3 md:mt-40">
        <ButtonLink href="/tools" variant="highlight">Try the tools</ButtonLink>
        <ButtonLink href="/privacy" variant="ghost">Read the privacy policy</ButtonLink>
      </div>
    </div>
  );
}
