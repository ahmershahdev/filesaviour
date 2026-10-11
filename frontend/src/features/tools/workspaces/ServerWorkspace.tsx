/**
 * Generic workspace for server and AI tools:
 * upload → POST /api/jobs → poll GET /api/jobs/<id> → download → delete.
 * Text-first AI tools also accept pasted text (sent as a .txt file).
 */
import { CheckCircle2, Download, Loader2, RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { csrfToken, formatBytes } from "@/lib/utils";
import type { JobRow } from "@/types";

import Dropzone from "../components/Dropzone";
import type { WorkspaceProps } from "./index";

type Phase = { name: "idle" } | { name: "uploading"; pct: number } | { name: "processing"; job: JobRow } | { name: "done"; job: JobRow } | { name: "error"; message: string };

export default function ServerWorkspace({ tool }: WorkspaceProps) {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [text, setText] = useState("");
  const poll = useRef<number>(0);
  const textFirst = tool.accepts.includes("paste");

  useEffect(() => () => window.clearTimeout(poll.current), []);

  const submit = (files: File[]) => {
    const form = new FormData();
    form.append("tool", tool.slug);
    form.append("options", "{}");
    files.forEach((f) => form.append("files", f));

    // XHR (not fetch) for upload progress.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/jobs");
    xhr.setRequestHeader("X-CSRFToken", csrfToken());
    xhr.upload.onprogress = (e) => e.lengthComputable && setPhase({ name: "uploading", pct: e.loaded / e.total });
    xhr.onload = () => {
      const body = safeJson(xhr.responseText);
      if (xhr.status !== 202) return setPhase({ name: "error", message: body.error ?? "Upload failed." });
      if (body.id) check(body.id);
    };
    xhr.onerror = () => setPhase({ name: "error", message: "Network error. Check your connection and try again." });
    setPhase({ name: "uploading", pct: 0 });
    xhr.send(form);
  };

  const check = async (id: string, attempt = 0) => {
    const res = await fetch(`/api/jobs/${id}`, { headers: { Accept: "application/json" } });
    const job: JobRow = await res.json();
    if (job.status === "done") return setPhase({ name: "done", job });
    if (job.status === "failed" || job.status === "expired") return setPhase({ name: "error", message: job.error || "Processing failed." });
    setPhase({ name: "processing", job });
    poll.current = window.setTimeout(() => check(id, attempt + 1), Math.min(800 + attempt * 250, 3000));
  };

  const remove = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE", headers: { "X-CSRFToken": csrfToken() } });
    setPhase({ name: "idle" });
  };

  if (phase.name === "idle")
    return (
      <div className="grid gap-4">
        {textFirst && (
          <div className="card p-2">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your text here…"
              className="block min-h-56 w-full resize-y bg-transparent p-4 text-lg leading-relaxed outline-none placeholder:text-fg-faint" />
            <div className="flex items-center justify-between gap-4 border-t border-line p-3">
              <span className="font-mono text-xs text-fg-faint">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
              <Button variant="highlight" disabled={text.trim().length < 20}
                onClick={() => submit([new File([text], "text.txt", { type: "text/plain" })])}>
                Run {tool.name}
              </Button>
            </div>
          </div>
        )}
        <Dropzone accept={tool.accepts} multiple={tool.batch} global onFiles={submit}
          title={textFirst ? "…or drop a document" : undefined} className={textFirst ? "min-h-44" : undefined} />
      </div>
    );

  return (
    <div className="card grid min-h-72 place-items-center p-8 text-center" aria-live="polite">
      {phase.name === "uploading" && (
        <Progress label="Uploading securely" pct={phase.pct} />
      )}
      {phase.name === "processing" && (
        <div className="grid justify-items-center gap-4">
          <Loader2 className="size-10 animate-spin text-highlight" aria-hidden />
          <p className="font-display text-3xl tracking-tight">{phase.job.status === "queued" ? "In the queue…" : "Working on it…"}</p>
          <p className="text-sm text-fg-muted">{phase.job.inputName} · {formatBytes(phase.job.inputBytes)}</p>
        </div>
      )}
      {phase.name === "done" && (
        <div className="grid justify-items-center gap-5">
          <CheckCircle2 className="size-12 text-mint-400" strokeWidth={1.5} aria-hidden />
          <p className="font-display text-4xl tracking-tight">Saved.</p>
          <p className="text-sm text-fg-muted">
            {phase.job.outputName} · {formatBytes(phase.job.outputBytes)}
            {phase.job.outputBytes < phase.job.inputBytes && (
              <span className="ml-2 font-mono text-mint-400">−{Math.round((1 - phase.job.outputBytes / phase.job.inputBytes) * 100)}%</span>
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={`/api/jobs/${phase.job.id}/file`} className="inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 font-medium text-highlight-fg">
              <Download className="size-4" aria-hidden /> Download
            </a>
            <Button variant="ghost" onClick={() => remove(phase.job.id)}><Trash2 className="size-4" aria-hidden />Delete now</Button>
            <Button variant="ghost" onClick={() => setPhase({ name: "idle" })}><RotateCcw className="size-4" aria-hidden />New file</Button>
          </div>
          <p className="text-xs text-fg-faint">Deleted automatically in 1 hour.</p>
        </div>
      )}
      {phase.name === "error" && (
        <div className="grid justify-items-center gap-4">
          <TriangleAlert className="size-10 text-coral-400" aria-hidden />
          <p role="alert" className="max-w-md text-lg">{phase.message}</p>
          <Button variant="ghost" onClick={() => setPhase({ name: "idle" })}>Try again</Button>
        </div>
      )}
    </div>
  );
}

function Progress({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex justify-between text-sm"><span>{label}</span><span className="font-mono">{Math.round(pct * 100)}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-highlight transition-[width]" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

function safeJson(s: string): { id?: string; error?: string } {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
