import { UploadCloud } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  accept: string[];
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title?: ReactNode;
  hint?: ReactNode;
  /** Also accept files dropped anywhere on the window (tool pages). */
  global?: boolean;
  /** Single-line pill used in the home hero. */
  compact?: boolean;
  className?: string;
};

export default function Dropzone({ accept, multiple, onFiles, title, hint, global, compact, className }: Props) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  const take = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const files = Array.from(list);
      onFiles(multiple ? files : files.slice(0, 1));
    },
    [multiple, onFiles],
  );

  useEffect(() => {
    if (!global) return;
    const enter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      depth.current += 1;
      setOver(true);
    };
    const leave = () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(false);
    };
    const prevent = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setOver(false);
      take(e.dataTransfer?.files ?? null);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", drop);
    };
  }, [global, take]);

  const exts = accept.filter((a) => a.startsWith("."));

  return (
    <>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!global) setOver(true);
        }}
        onDragLeave={() => !global && setOver(false)}
        onDrop={(e) => {
          if (global) return; // handled by the window listener
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          "group relative cursor-pointer overflow-hidden border transition duration-500",
          compact
            ? "flex items-center gap-4 rounded-full py-2 pl-2 pr-6 text-left backdrop-blur-md"
            : "grid min-h-72 place-items-center rounded-[1.75rem] border-dashed p-8 text-center",
          over ? "border-highlight bg-highlight/10" : "border-line-strong bg-surface hover:bg-surface-2",
          className,
        )}
      >
        {compact ? (
          <>
            <span className={cn("grid size-12 shrink-0 place-items-center rounded-full transition", over ? "bg-highlight text-highlight-fg" : "bg-fg text-bg group-hover:scale-105")}>
              <UploadCloud className="size-5" strokeWidth={1.6} aria-hidden />
            </span>
            <span className="grid">
              <span className="font-medium">{title}</span>
              <span className="text-sm text-fg-muted">{hint}</span>
            </span>
          </>
        ) : (
        <>
        {/* Concentric "vault door" rings: they spin up when a file hovers */}
        <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          {[18, 28, 38].map((s, i) => (
            <span
              key={s}
              className={cn("absolute rounded-full border border-line transition-all duration-700", over && "border-highlight/40")}
              style={{ width: `${s}rem`, height: `${s}rem`, transform: over ? `scale(${0.9 - i * 0.04}) rotate(${(i + 1) * 30}deg)` : undefined, borderStyle: i === 1 ? "dashed" : "solid" }}
            />
          ))}
        </span>
        <span className="relative grid justify-items-center gap-4">
          <span className={cn("grid size-16 place-items-center rounded-full transition duration-500", over ? "scale-110 bg-highlight text-highlight-fg" : "bg-fg text-bg group-hover:scale-105")}>
            <UploadCloud className="size-7" strokeWidth={1.6} aria-hidden />
          </span>
          <span className="font-display text-2xl tracking-tight md:text-3xl">{title ?? (multiple ? "Drop your files here" : "Drop your file here")}</span>
          <span className="text-sm text-fg-muted">
            {hint ?? <>or <span className="underline decoration-highlight underline-offset-4">browse</span>{exts.length > 0 && <> · {exts.slice(0, 6).join(" ").toUpperCase()}</>}</>}
          </span>
        </span>
        </>
        )}
        <input
          ref={input}
          id={inputId}
          type="file"
          className="sr-only"
          accept={exts.join(",")}
          multiple={multiple}
          onChange={(e) => {
            take(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {global && over && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-bg/70 backdrop-blur-md">
          <p className="font-display text-display tracking-tight">Let go<span className="serif-em text-highlight">.</span></p>
        </div>
      )}
    </>
  );
}
