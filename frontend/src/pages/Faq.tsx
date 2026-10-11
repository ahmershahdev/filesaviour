import { usePage } from "@inertiajs/react";
import { Plus } from "lucide-react";

import { ButtonLink } from "@/components/ui";
import type { SharedProps } from "@/types";

type Group = { title: string; items: { q: string; a: string }[] };

export default function Faq({ groups }: { groups: Group[] }) {
  const { site } = usePage<SharedProps>().props;
  return (
    <div className="shell pt-32 md:pt-40">
      <p className="eyebrow mb-5">Help centre</p>
      <h1 className="text-display">Frequently <span className="serif-em text-fg-muted">asked</span></h1>

      <div className="mt-20 grid gap-20">
        {groups.map((g, gi) => (
          <section key={g.title} className="grid gap-8 md:grid-cols-12">
            <h2 className="md:col-span-4">
              <span className="eyebrow mb-3 block text-highlight">0{gi + 1}</span>
              <span className="text-title">{g.title}</span>
            </h2>
            <div className="md:col-span-8">
              {g.items.map((f) => (
                <details key={f.q} className="group border-b border-line py-6 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-medium">
                    {f.q}
                    <Plus className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="mt-4 max-w-2xl leading-relaxed text-fg-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="card mt-28 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-12">
        <div>
          <h2 className="text-title">Still stuck?</h2>
          <p className="mt-2 text-fg-muted">Email {site.supportEmail}. A human replies within two working days.</p>
        </div>
        <ButtonLink href="/contact" variant="highlight">Contact support</ButtonLink>
      </div>
    </div>
  );
}
