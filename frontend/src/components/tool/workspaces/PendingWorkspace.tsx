import { Hourglass } from "lucide-react";

import type { WorkspaceProps } from "./index";

/** Honest placeholder for tools whose engine hasn't shipped yet. Never fake a result. */
export default function PendingWorkspace({ tool }: WorkspaceProps) {
  return (
    <div className="card grid min-h-72 place-items-center p-10 text-center">
      <div className="grid max-w-md justify-items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full border border-line"><Hourglass className="size-6 text-highlight" aria-hidden /></span>
        <p className="font-display text-3xl tracking-tight">{tool.name} is being built</p>
        <p className="text-fg-muted">The page is live so you can bookmark it. The workspace is still in development. Want an email when it's ready?</p>
        <a href={`mailto:support@ahmershah.dev?subject=${encodeURIComponent(`Notify me: ${tool.name}`)}`} className="text-sm underline decoration-highlight underline-offset-4">
          Notify me
        </a>
      </div>
    </div>
  );
}
