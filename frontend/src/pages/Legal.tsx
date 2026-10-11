import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Doc = { title: string; updated: string; intro: string; sections: { id: string; heading: string; body: string[] }[] };

/** Shared renderer for Terms, Privacy and Cookies (content lives in apps/core/content.py). */
export default function Legal({ doc }: { doc: Doc }) {
  const [active, setActive] = useState(doc.sections[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [doc]);

  return (
    <div className="shell pt-32 md:pt-40">
      <p className="eyebrow mb-5">Last updated <time dateTime={doc.updated}>{new Date(doc.updated).toLocaleDateString("en", { dateStyle: "long" })}</time></p>
      <h1 className="text-display max-w-4xl">{doc.title}</h1>
      <p className="text-lede mt-8 max-w-2xl text-fg-muted">{doc.intro}</p>

      <div className="mt-20 grid gap-12 md:grid-cols-12">
        <nav aria-label="On this page" className="hidden md:col-span-3 md:block">
          <ol className="sticky top-28 grid gap-1 border-l border-line">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={cn("-ml-px block border-l py-1.5 pl-4 text-sm transition", active === s.id ? "border-highlight text-fg" : "border-transparent text-fg-faint hover:text-fg-muted")}>
                  {s.heading.replace(/^\d+\.\s*/, "")}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="prose-fs max-w-2xl md:col-span-8 md:col-start-5">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2>{s.heading}</h2>
              {s.body.length > 2 ? <ul>{s.body.map((p, i) => <li key={i}>{p}</li>)}</ul> : s.body.map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
