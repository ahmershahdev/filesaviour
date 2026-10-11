/**
 * Shared in-browser image engine for compress / resize / convert.
 * Uses createImageBitmap + OffscreenCanvas-compatible canvas encoding; no
 * upload. HEIC and AVIF decoding depend on the browser.
 */
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui";
import { cn, download, formatBytes, logBrowserRun } from "@/lib/utils";

import Dropzone from "../components/Dropzone";
import type { WorkspaceProps } from "./index";

type Format = "image/jpeg" | "image/webp" | "image/png" | "image/avif";
const FORMATS: { mime: Format; label: string; ext: string }[] = [
  { mime: "image/webp", label: "WebP", ext: "webp" },
  { mime: "image/jpeg", label: "JPG", ext: "jpg" },
  { mime: "image/png", label: "PNG", ext: "png" },
  { mime: "image/avif", label: "AVIF", ext: "avif" },
];
const PRESETS = [
  { label: "Instagram post", w: 1080, h: 1350 },
  { label: "YouTube thumbnail", w: 1280, h: 720 },
  { label: "LinkedIn banner", w: 1584, h: 396 },
  { label: "Full HD", w: 1920, h: 1080 },
];

export default function ImageStudio({ tool }: WorkspaceProps) {
  const mode = tool.slug.split("-")[0] as "compress" | "resize" | "convert";
  const [file, setFile] = useState<File | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [quality, setQuality] = useState(mode === "compress" ? 0.72 : 0.9);
  const [format, setFormat] = useState<Format>("image/webp");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [result, setResult] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const original = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  const preview = useMemo(() => (result ? URL.createObjectURL(result) : ""), [result]);
  useEffect(() => () => { if (original) URL.revokeObjectURL(original); }, [original]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const load = async ([f]: File[]) => {
    setError("");
    setResult(null);
    try {
      const bmp = await createImageBitmap(f);
      setFile(f);
      setBitmap(bmp);
      setWidth(bmp.width);
      setHeight(bmp.height);
      if (mode !== "convert" && /image\/(jpeg|png|webp)/.test(f.type)) setFormat(f.type as Format);
    } catch {
      setError("This browser can't decode that image. Try JPG, PNG or WebP, or use a server tool.");
    }
  };

  // Re-encode whenever settings change (debounced).
  useEffect(() => {
    if (!bitmap) return;
    setBusy(true);
    const t = setTimeout(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      if (format === "image/jpeg") {
        ctx.fillStyle = "#fff"; // JPG has no alpha
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        setBusy(false);
        if (!b) return setError("Your browser can't export this format. Pick another.");
        if (b.type !== format) setError(`${format.split("/")[1].toUpperCase()} export isn't supported here; saved as ${b.type.split("/")[1].toUpperCase()}.`);
        setResult(b);
      }, format, format === "image/png" ? undefined : quality);
    }, 220);
    return () => clearTimeout(t);
  }, [bitmap, width, height, format, quality]);

  const save = () => {
    if (!result || !file) return;
    const ext = FORMATS.find((f) => f.mime === result.type)?.ext ?? "img";
    download(result, `${file.name.replace(/\.[^.]+$/, "")}-filesaviour.${ext}`);
    logBrowserRun(tool.slug, file.size, result.size);
  };

  const setW = (w: number) => {
    setWidth(w);
    if (lock && bitmap) setHeight(Math.round((w / bitmap.width) * bitmap.height));
  };
  const setH = (h: number) => {
    setHeight(h);
    if (lock && bitmap) setWidth(Math.round((h / bitmap.height) * bitmap.width));
  };

  if (!file) return (
    <>
      <Dropzone accept={tool.accepts} global onFiles={load} title="Drop an image" />
      {error && <p role="alert" className="mt-4 text-sm text-coral-400">{error}</p>}
    </>
  );

  const saved = result ? 1 - result.size / file.size : 0;

  return (
    <div className="card grid overflow-hidden lg:grid-cols-[1fr_22rem]">
      <div className="relative grid min-h-80 place-items-center bg-[repeating-conic-gradient(var(--surface-2)_0_25%,transparent_0_50%)] bg-[length:20px_20px] p-6">
        <img src={preview || original} alt="Preview of the processed image" className="max-h-[60vh] w-auto rounded-lg shadow-2xl shadow-black/30" />
        {busy && <Loader2 className="absolute right-4 top-4 size-5 animate-spin text-fg-muted" aria-label="Processing" />}
      </div>
      <div className="grid content-start gap-6 border-t border-line p-6 lg:border-l lg:border-t-0">
        <div>
          <p className="eyebrow mb-2">Result</p>
          <p className="font-display text-4xl tracking-tight">{result ? formatBytes(result.size) : "—"}</p>
          <p className="mt-1 text-sm text-fg-muted">
            from {formatBytes(file.size)}
            {result && <span className={cn("ml-2 font-mono", saved > 0 ? "text-mint-400" : "text-fg-faint")}>{saved > 0 ? `−${Math.round(saved * 100)}%` : `+${Math.round(-saved * 100)}%`}</span>}
          </p>
        </div>

        <fieldset className="grid gap-2">
          <legend className="eyebrow mb-2">Format</legend>
          <div className="grid grid-cols-4 gap-1 rounded-full border border-line p-1">
            {FORMATS.map((f) => (
              <button key={f.mime} type="button" onClick={() => setFormat(f.mime)} aria-pressed={format === f.mime}
                className={cn("rounded-full py-1.5 text-sm transition", format === f.mime ? "bg-fg text-bg" : "text-fg-muted hover:text-fg")}>
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>

        {format !== "image/png" && (
          <label className="grid gap-2">
            <span className="flex justify-between"><span className="eyebrow">Quality</span><span className="font-mono text-sm">{Math.round(quality * 100)}</span></span>
            <input type="range" min={0.3} max={1} step={0.01} value={quality} onChange={(e) => setQuality(+e.target.value)} className="accent-[var(--highlight)]" />
          </label>
        )}

        <fieldset className="grid gap-3">
          <legend className="eyebrow mb-2">Size (px)</legend>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input aria-label="Width" placeholder="Width" type="number" min={1} value={width} onChange={(e) => setW(+e.target.value)} className="h-11 rounded-xl border border-line bg-surface px-3 font-mono" />
            <button type="button" onClick={() => setLock(!lock)} aria-pressed={lock} className="text-xs text-fg-muted" title="Lock aspect ratio">{lock ? "🔒" : "🔓"}</button>
            <input aria-label="Height" placeholder="Height" type="number" min={1} value={height} onChange={(e) => setH(+e.target.value)} className="h-11 rounded-xl border border-line bg-surface px-3 font-mono" />
          </div>
          {mode === "resize" && (
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => { setLock(false); setWidth(p.w); setHeight(p.h); }}
                  className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted hover:text-fg">{p.label}</button>
              ))}
              {[25, 50, 75].map((pct) => (
                <button key={pct} type="button" onClick={() => bitmap && (setLock(true), setWidth(Math.round(bitmap.width * pct / 100)), setHeight(Math.round(bitmap.height * pct / 100)))}
                  className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted hover:text-fg">{pct}%</button>
              ))}
            </div>
          )}
        </fieldset>

        {error && <p role="alert" className="text-sm text-coral-400">{error}</p>}
        <div className="flex gap-2">
          <Button variant="highlight" className="flex-1" onClick={save} disabled={!result || busy}><Download className="size-4" aria-hidden />Download</Button>
          <Button variant="ghost" aria-label="Start over" onClick={() => { setFile(null); setBitmap(null); setResult(null); }}><RotateCcw className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}
