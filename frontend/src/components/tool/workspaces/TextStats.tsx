/** Word counter + text analyzer: pure, instant, local. */
import { useDeferredValue, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import type { WorkspaceProps } from "./index";

const STOP = new Set("the a an and or but of to in on for with is are was were be been it this that as at by from your you we they i he she not have has had do does did so if then than there their its our".split(" "));

function syllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  return Math.max(1, (w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g) || []).length);
}

function analyse(text: string) {
  const words = text.match(/[\p{L}\p{N}'’-]+/gu) ?? [];
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  const wps = words.length / Math.max(sentences, 1);
  const spw = syl / Math.max(words.length, 1);
  const flesch = words.length ? 206.835 - 1.015 * wps - 84.6 * spw : 0;
  const grade = words.length ? 0.39 * wps + 11.8 * spw - 15.59 : 0;
  const freq = new Map<string, number>();
  words.forEach((w) => {
    const k = w.toLowerCase();
    if (k.length > 2 && !STOP.has(k)) freq.set(k, (freq.get(k) ?? 0) + 1);
  });
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const unique = new Set(words.map((w) => w.toLowerCase())).size;
  const passive = (text.match(/\b(am|is|are|was|were|be|been|being)\s+\w+(ed|en)\b/gi) ?? []).length;
  return {
    words: words.length,
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, "").length,
    sentences,
    paragraphs,
    reading: Math.ceil(words.length / 238),
    speaking: Math.ceil(words.length / 140),
    flesch: Math.max(0, Math.min(100, flesch)),
    grade: Math.max(0, grade),
    avgSentence: wps,
    diversity: words.length ? unique / words.length : 0,
    passive,
    top,
  };
}

function label(flesch: number) {
  if (flesch >= 80) return "Very easy";
  if (flesch >= 60) return "Plain English";
  if (flesch >= 50) return "Fairly difficult";
  if (flesch >= 30) return "Difficult";
  return "Very difficult";
}

export default function TextStats({ tool }: WorkspaceProps) {
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);
  const s = useMemo(() => analyse(deferred), [deferred]);
  const advanced = tool.slug === "text-analyzer";

  const primary = [
    ["Words", s.words],
    ["Characters", s.chars],
    ["Sentences", s.sentences],
    ["Paragraphs", s.paragraphs],
    ["Reading time", `${s.reading} min`],
    ["Speaking time", `${s.speaking} min`],
  ] as const;

  return (
    <div className="card grid overflow-hidden lg:grid-cols-[1fr_24rem]">
      <label className="relative block">
        <span className="sr-only">Your text</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text. Nothing leaves this page."
          className="block min-h-[26rem] w-full resize-y bg-transparent p-6 text-lg leading-relaxed outline-none placeholder:text-fg-faint md:p-8"
          autoFocus
        />
        <span className="absolute bottom-4 left-6 font-mono text-xs text-fg-faint md:left-8">{s.charsNoSpace} characters without spaces</span>
      </label>
      <aside aria-live="polite" className="border-t border-line p-6 lg:border-l lg:border-t-0">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {primary.map(([k, v], i) => (
            <div key={k} className={cn("bg-bg-raised p-4", i === 0 && "col-span-2")}>
              <dt className="eyebrow">{k}</dt>
              <dd className={cn("mt-1 font-display tracking-tight", i === 0 ? "text-6xl" : "text-2xl")}>{v}</dd>
            </div>
          ))}
        </dl>
        {(advanced || s.words > 30) && (
          <div className="mt-6 grid gap-4">
            <div>
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">Readability (Flesch)</p>
                <p className="font-mono text-sm">{s.flesch.toFixed(0)} · {label(s.flesch)}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-highlight transition-[width] duration-500" style={{ width: `${s.flesch}%` }} />
              </div>
            </div>
            {advanced && (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-fg-faint">Grade level</dt><dd className="font-mono">{s.grade.toFixed(1)}</dd></div>
                <div><dt className="text-fg-faint">Avg sentence</dt><dd className="font-mono">{s.avgSentence.toFixed(1)} words</dd></div>
                <div><dt className="text-fg-faint">Lexical diversity</dt><dd className="font-mono">{(s.diversity * 100).toFixed(0)}%</dd></div>
                <div><dt className="text-fg-faint">Passive voice</dt><dd className="font-mono">{s.passive} found</dd></div>
              </dl>
            )}
            {s.top.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Top keywords</p>
                <ul className="flex flex-wrap gap-1.5">
                  {s.top.map(([w, n]) => (
                    <li key={w} className="rounded-full border border-line px-2.5 py-1 text-xs">
                      {w} <span className="font-mono text-fg-faint">{((n / s.words) * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
