import clsx, { type ClassValue } from "clsx";

export const cn = (...v: ClassValue[]) => clsx(v);

export function formatBytes(bytes: number, digits = 1): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : digits)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function csrfToken(): string {
  return document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1] ?? "";
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Anonymous usage ping for browser tools: sizes only, never file contents. */
export function logBrowserRun(tool: string, inputBytes: number, outputBytes: number) {
  fetch("/api/jobs/log", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    body: JSON.stringify({ tool, inputBytes, outputBytes }),
    keepalive: true,
  }).catch(() => {});
}

export const CATEGORY_ACCENT: Record<string, string> = {
  pdf: "var(--color-vault-500)",
  image: "var(--color-sky-400)",
  ai: "var(--color-signal-500)",
  utility: "var(--color-mint-400)",
};
