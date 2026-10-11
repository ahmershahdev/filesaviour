import { Link, usePage } from "@inertiajs/react";
import { Download } from "lucide-react";

import { ToolCard } from "@/features/tools/components/ToolCard";
import AppLayout from "@/layouts/AppLayout";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import type { JobRow, SharedProps, ToolCard as ToolCardType } from "@/types";

type Props = { stats: { jobs: number; bytesSaved: number }; favourites: (ToolCardType & { uses: number })[]; recent: JobRow[] };

const STATUS: Record<JobRow["status"], string> = {
  done: "text-mint-400", failed: "text-coral-400", queued: "text-fg-muted", running: "text-sky-400", expired: "text-fg-faint",
};

function Dashboard({ stats, favourites, recent }: Props) {
  const { auth, catalog } = usePage<SharedProps>().props;
  const name = (slug: string) => catalog.tools.find((t) => t.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow">Dashboard</p>
      <h1 className="text-headline mt-3">Hello, <span className="serif-em">{auth.user?.name}</span></h1>

      <dl className="mt-10 grid gap-3 sm:grid-cols-3">
        {[["Files processed", stats.jobs.toLocaleString()], ["Space saved", formatBytes(stats.bytesSaved)], ["History kept", "7 days"]].map(([k, v]) => (
          <div key={k} className="card p-6"><dt className="eyebrow">{k}</dt><dd className="mt-3 font-display text-5xl tracking-tight">{v}</dd></div>
        ))}
      </dl>

      <section className="mt-14">
        <h2 className="text-title mb-6">Recent files</h2>
        {recent.length ? (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line text-fg-faint">
                <tr><th className="p-4 font-normal">Tool</th><th className="p-4 font-normal">File</th><th className="p-4 font-normal">Size</th><th className="p-4 font-normal">Status</th><th className="p-4 font-normal">When</th><th className="p-4" /></tr>
              </thead>
              <tbody>
                {recent.map((j) => (
                  <tr key={j.id} className="border-b border-line last:border-0">
                    <td className="p-4"><Link href={`/${j.tool}`} className="hover:underline">{name(j.tool)}</Link></td>
                    <td className="max-w-56 truncate p-4 text-fg-muted">{j.inputName || "—"}</td>
                    <td className="p-4 font-mono text-xs">{formatBytes(j.inputBytes)}{j.outputBytes ? ` → ${formatBytes(j.outputBytes)}` : ""}</td>
                    <td className={cn("p-4 font-mono text-xs uppercase", STATUS[j.status])}>{j.status}</td>
                    <td className="p-4 text-fg-muted">{formatDate(j.createdAt)}</td>
                    <td className="p-4 text-right">
                      {j.downloadable && <a href={`/api/jobs/${j.id}/file`} aria-label="Download result" className="inline-grid size-8 place-items-center rounded-full border border-line hover:bg-surface-2"><Download className="size-4" /></a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="card p-10 text-center text-fg-muted">Nothing yet. <Link href="/tools" className="text-fg underline decoration-highlight underline-offset-4">Pick a tool</Link> to get started.</p>
        )}
      </section>

      {favourites.length > 0 && (
        <section className="mt-14">
          <h2 className="text-title mb-6">Your go-to tools</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{favourites.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
        </section>
      )}
    </div>
  );
}

Dashboard.layout = AppLayout;
export default Dashboard;
