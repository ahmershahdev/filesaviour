import { Link } from "@inertiajs/react";

import { RuntimeBadge } from "@/components/ui";
import AppLayout from "@/layouts/AppLayout";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import type { JobRow, ToolCard } from "@/types";

type ToolHealth = ToolCard & { runs: number; failed: number; failRate: number; avgMs: number | null };
type Props = {
  kpis: { runs24h: number; runs7d: number; failed24h: number; users: number; newUsers7d: number; bytesSaved7d: number; queued: number; posts: number };
  daily: { day: string; runs: number }[];
  tools: ToolHealth[];
  failures: (JobRow & { error: string })[];
};

function Overview({ kpis, daily, tools, failures }: Props) {
  const max = Math.max(1, ...daily.map((d) => d.runs));
  const cards = [
    ["Runs · 24h", kpis.runs24h.toLocaleString()],
    ["Runs · 7d", kpis.runs7d.toLocaleString()],
    ["Failures · 24h", kpis.failed24h.toLocaleString(), kpis.failed24h > 0],
    ["In queue", kpis.queued.toLocaleString()],
    ["Users", kpis.users.toLocaleString()],
    ["New users · 7d", kpis.newUsers7d.toLocaleString()],
    ["Saved · 7d", formatBytes(kpis.bytesSaved7d)],
    ["Published posts", kpis.posts.toLocaleString()],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl">
      <p className="eyebrow">Staff console</p>
      <h1 className="text-headline mt-3">Operations</h1>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line lg:grid-cols-4">
        {cards.map(([k, v, alert]) => (
          <div key={k} className="bg-bg p-5">
            <dt className="eyebrow">{k}</dt>
            <dd className={cn("mt-2 font-display text-4xl tracking-tight", alert && "text-coral-400")}>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="card mt-8 p-6">
        <h2 className="eyebrow mb-6">Runs per day · last 14 days</h2>
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label={`Daily runs, peak ${max}`}>
          {daily.map((d) => (
            <div key={d.day} className="group relative flex-1">
              <div className="rounded-t-md bg-highlight/80 transition group-hover:bg-highlight" style={{ height: `${Math.max(2, (d.runs / max) * 160)}px` }} />
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-fg px-1.5 py-0.5 font-mono text-[0.65rem] text-bg opacity-0 group-hover:opacity-100">{d.runs} · {d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-title mb-4">Tool health · 7 days</h2>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-fg-faint">
              <tr><th className="p-3 font-normal">Tool</th><th className="p-3 font-normal">Runs on</th><th className="p-3 font-normal">Status</th><th className="p-3 text-right font-normal">Runs</th><th className="p-3 text-right font-normal">Fail %</th><th className="p-3 text-right font-normal">Avg time</th></tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.slug} className="border-b border-line last:border-0">
                  <td className="p-3"><Link href={t.path} className="hover:underline">{t.name}</Link></td>
                  <td className="p-3"><RuntimeBadge runtime={t.runtime} /></td>
                  <td className="p-3 font-mono text-xs uppercase text-fg-muted">{t.status}</td>
                  <td className="p-3 text-right font-mono">{t.runs}</td>
                  <td className={cn("p-3 text-right font-mono", t.failRate > 5 ? "text-coral-400" : "text-fg-muted")}>{t.failRate}%</td>
                  <td className="p-3 text-right font-mono text-fg-muted">{t.avgMs === null ? "—" : `${(t.avgMs / 1000).toFixed(1)}s`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-title mb-4">Recent failures</h2>
        {failures.length ? (
          <ul className="card divide-y divide-line">
            {failures.map((f) => (
              <li key={f.id} className="grid gap-1 p-4 md:grid-cols-[12rem_1fr_auto] md:items-center md:gap-4">
                <span className="font-medium">{f.tool}</span>
                <span className="text-sm text-coral-400">{f.error}</span>
                <span className="font-mono text-xs text-fg-faint">{formatDate(f.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="card p-8 text-center text-fg-muted">No failures. 🎉</p>}
      </section>
    </div>
  );
}

Overview.layout = AppLayout;
export default Overview;
