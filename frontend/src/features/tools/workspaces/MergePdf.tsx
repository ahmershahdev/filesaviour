import { motion, Reorder } from "motion/react";
import { FileText, GripVertical, Loader2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { download, formatBytes, logBrowserRun } from "@/lib/utils";

import Dropzone from "../components/Dropzone";
import type { WorkspaceProps } from "./index";

type Item = { id: string; file: File; pages?: number };

export default function MergePdf({ tool }: WorkspaceProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (files: File[]) => {
    setError("");
    const { PDFDocument } = await import("pdf-lib");
    const next: Item[] = [];
    for (const file of files) {
      try {
        const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
        next.push({ id: crypto.randomUUID(), file, pages: doc.getPageCount() });
      } catch {
        setError(`${file.name} couldn't be read. It may be password-protected or damaged.`);
      }
    }
    setItems((cur) => [...cur, ...next]);
  };

  const merge = async () => {
    setBusy(true);
    setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const it of items) {
        const src = await PDFDocument.load(await it.file.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      out.setProducer("FileSaviour");
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      download(blob, "merged.pdf");
      logBrowserRun(tool.slug, items.reduce((n, i) => n + i.file.size, 0), blob.size);
    } catch {
      setError("Merging failed. Remove any damaged files and try again.");
    } finally {
      setBusy(false);
    }
  };

  const totalPages = items.reduce((n, i) => n + (i.pages ?? 0), 0);

  if (!items.length) return <Dropzone accept={tool.accepts} multiple global onFiles={add} title="Drop PDFs to merge" />;

  return (
    <div className="card p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow">{items.length} files · {totalPages} pages · drag to reorder</p>
        <label className="cursor-pointer text-sm underline decoration-highlight underline-offset-4">
          Add more
          <input type="file" accept=".pdf" multiple className="sr-only" onChange={(e) => e.target.files && add(Array.from(e.target.files))} />
        </label>
      </div>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="grid gap-2">
        {items.map((it, i) => (
          <Reorder.Item key={it.id} value={it} className="flex cursor-grab items-center gap-4 rounded-2xl border border-line bg-bg-raised p-3 active:cursor-grabbing">
            <GripVertical className="size-4 text-fg-faint" aria-hidden />
            <span className="font-mono text-xs text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
            <FileText className="size-5 text-vault-400" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{it.file.name}</span>
            <span className="hidden font-mono text-xs text-fg-faint sm:block">{it.pages} pp · {formatBytes(it.file.size)}</span>
            <button className="grid size-8 place-items-center rounded-full hover:bg-surface-2" aria-label={`Remove ${it.file.name}`}
              onClick={() => setItems((cur) => cur.filter((x) => x.id !== it.id))}>
              <X className="size-4" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {error && <p role="alert" className="mt-4 text-sm text-coral-400">{error}</p>}
      <motion.div layout className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button className="text-sm text-fg-muted hover:text-fg" onClick={() => setItems([])}>Start over</button>
        <Button variant="highlight" onClick={merge} disabled={busy || items.length < 2}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {items.length < 2 ? "Add at least 2 PDFs" : busy ? "Merging…" : `Merge ${items.length} PDFs`}
        </Button>
      </motion.div>
    </div>
  );
}
