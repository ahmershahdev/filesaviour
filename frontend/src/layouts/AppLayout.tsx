import { Link, router, usePage } from "@inertiajs/react";
import { BarChart3, Clock3, ExternalLink, LayoutGrid, LogOut, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

import Flash from "@/components/site/Flash";
import { Wordmark } from "@/components/site/Logo";
import Seo from "@/components/site/Seo";
import ThemeToggle from "@/components/site/ThemeToggle";
import { cn } from "@/lib/utils";
import type { SharedProps } from "@/types";

/** Shell for signed-in areas: user dashboard and staff console. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { auth } = usePage<SharedProps>().props;
  const { url } = usePage();
  const user = auth.user!;
  const nav = [
    { href: "/dashboard", label: "Overview", icon: Clock3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/tools", label: "All tools", icon: LayoutGrid },
    ...(user.isStaff
      ? [
          { href: "/console", label: "Console", icon: BarChart3, staff: true },
          { href: "/console/users", label: "Users", icon: Users, staff: true },
        ]
      : []),
  ];

  return (
    <>
      <Seo />
      <Flash />
      <div className="grid min-h-dvh md:grid-cols-[16rem_1fr]">
        <aside className="border-b border-line p-4 md:sticky md:top-0 md:h-dvh md:border-b-0 md:border-r md:p-6">
          <div className="flex items-center justify-between md:block">
            <Link href="/" aria-label="FileSaviour home"><Wordmark /></Link>
            <div className="md:hidden"><ThemeToggle /></div>
          </div>
          <nav aria-label="Account" className="mt-4 flex gap-1 overflow-x-auto md:mt-10 md:grid">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className={cn("flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition",
                  url === n.href ? "bg-surface-2 text-fg" : "text-fg-muted hover:bg-surface hover:text-fg")}>
                <n.icon className="size-4" aria-hidden />
                {n.label}
                {"staff" in n && <span className="ml-auto rounded bg-highlight px-1.5 font-mono text-[0.6rem] text-highlight-fg">STAFF</span>}
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden md:absolute md:inset-x-6 md:bottom-6 md:grid md:gap-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm text-fg-muted" title={user.email}>{user.name}</span>
              <ThemeToggle />
            </div>
            {user.adminPath && (
              <a href={user.adminPath} className="flex items-center gap-2 text-xs text-fg-faint hover:text-fg"><ExternalLink className="size-3.5" aria-hidden />Data admin</a>
            )}
            <button onClick={() => router.post("/account/logout")} className="flex items-center gap-2 text-sm text-fg-faint hover:text-fg">
              <LogOut className="size-4" aria-hidden />Log out
            </button>
          </div>
        </aside>
        <main id="main" className="min-w-0 p-4 md:p-10">{children}</main>
      </div>
    </>
  );
}
