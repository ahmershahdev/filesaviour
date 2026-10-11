import { Link, usePage } from "@inertiajs/react";
import { ArrowUpRight, FileQuestion, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { RuntimeBadge } from "@/components/ui";
import { ToolIcon } from "@/lib/icons";
import { CATEGORY_ACCENT, formatBytes } from "@/lib/utils";
import type { SharedProps } from "@/types";

import Dropzone from "./Dropzone";

/**
 * Home-page "drop anything": we don't upload, we just read the extension and
 * suggest every tool that accepts it. Picking a tool navigates to it.
 */
export default function SmartDrop() {
  const { catalog } = usePage<SharedProps>().props;
  const [file, setFile] = useState<File | null>(null);

  const ext = file ? `.${file.name.split(".").pop()?.toLowerCase()}` : "";
  const matches = file ? catalog.tools.filter((t) => t.accepts.includes(ext) && t.status !== "soon") : [];

  return (
    <>
      <Dropzone
        accept={[]}
        global
        onFiles={([f]) => setFile(f)}
        title="Drop any file"
        hint="We'll suggest the right tool. Nothing is uploaded."
        compact
      />
      <AnimatePresence>
        {file && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Tools for ${file.name}`}
            className="fixed inset-0 z-[85] grid items-end bg-bg/60 backdrop-blur-md md:place-items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFile(null)}
          >
            <motion.div
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-line-strong bg-bg-raised p-6 md:max-w-2xl md:rounded-3xl md:p-8"
              initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{ext.toUpperCase().slice(1)} · {formatBytes(file.size)}</p>
                  <h2 className="mt-2 font-display text-3xl tracking-tight">
                    {matches.length ? <>What should we do with <span className="serif-em">{file.name}</span>?</> : "No tool for this file type yet"}
                  </h2>
                </div>
                <button onClick={() => setFile(null)} className="grid size-10 shrink-0 place-items-center rounded-full border border-line" aria-label="Close"><X className="size-4" /></button>
              </div>
              {matches.length ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {matches.map((t) => (
                    <li key={t.slug}>
                      <Link href={t.path} className="group flex h-full items-start gap-3 rounded-2xl border border-line p-4 transition hover:border-line-strong hover:bg-surface-2">
                        <ToolIcon name={t.icon} className="mt-0.5 size-5 shrink-0" />
                        <span className="grid gap-1.5">
                          <span className="flex items-center gap-2 font-medium" style={{ color: CATEGORY_ACCENT[t.category] }}>{t.name}<ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" /></span>
                          <RuntimeBadge runtime={t.runtime} className="w-fit" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 flex items-center gap-3 text-fg-muted"><FileQuestion className="size-5" />Try the <Link href="/file-converter" className="underline">File Converter</Link>, or tell us what you need.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
