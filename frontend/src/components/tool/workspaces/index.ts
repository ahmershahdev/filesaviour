import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import type { Tool } from "@/types";

export type WorkspaceProps = { tool: Tool };
type Workspace = LazyExoticComponent<ComponentType<WorkspaceProps>>;

/**
 * Tool slug → workspace UI. Each is its own chunk (pdf-lib only loads on PDF
 * tools). Tools without a dedicated entry fall back by runtime:
 *   server / ai  → ServerWorkspace (upload → queue → poll → download)
 *   browser      → PendingWorkspace until its client-side engine ships
 */
const MergePdf = lazy(() => import("./MergePdf"));
const ImageStudio = lazy(() => import("./ImageStudio"));
const TextStats = lazy(() => import("./TextStats"));
const ServerWorkspace = lazy(() => import("./ServerWorkspace"));
const PendingWorkspace = lazy(() => import("./PendingWorkspace"));

const DEDICATED: Record<string, Workspace> = {
  "merge-pdf": MergePdf,
  "compress-image": ImageStudio,
  "resize-image": ImageStudio,
  "convert-image": ImageStudio,
  "word-counter": TextStats,
  "text-analyzer": TextStats,
};

export function workspaceFor(tool: Tool): Workspace {
  if (tool.status === "soon") return PendingWorkspace;
  return DEDICATED[tool.slug] ?? (tool.runtime === "browser" ? PendingWorkspace : ServerWorkspace);
}
