import { router } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useState } from "react";

import AppLayout from "@/layouts/AppLayout";
import { formatDate } from "@/lib/utils";

type Row = { id: number; email: string; name: string; isStaff: boolean; jobs: number; joined: string; lastLogin: string | null };

function Users({ users, query }: { users: Row[]; query: string }) {
  const [q, setQ] = useState(query);
  return (
    <div className="mx-auto max-w-7xl">
      <p className="eyebrow">Staff console</p>
      <h1 className="text-headline mt-3">Users</h1>
      <form className="relative mt-8 max-w-md" onSubmit={(e) => { e.preventDefault(); router.get("/console/users", q ? { q } : {}, { preserveState: true }); }}>
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-faint" aria-hidden />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name…" aria-label="Search users"
          className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 outline-none focus:border-accent" />
      </form>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line text-fg-faint">
            <tr><th className="p-3 font-normal">Email</th><th className="p-3 font-normal">Name</th><th className="p-3 text-right font-normal">Jobs</th><th className="p-3 font-normal">Joined</th><th className="p-3 font-normal">Last login</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="p-3">{u.email}{u.isStaff && <span className="ml-2 rounded bg-highlight px-1.5 font-mono text-[0.6rem] text-highlight-fg">STAFF</span>}</td>
                <td className="p-3 text-fg-muted">{u.name || "—"}</td>
                <td className="p-3 text-right font-mono">{u.jobs}</td>
                <td className="p-3 text-fg-muted">{formatDate(u.joined)}</td>
                <td className="p-3 text-fg-muted">{u.lastLogin ? formatDate(u.lastLogin) : "Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="p-10 text-center text-fg-muted">No users match.</p>}
      </div>
      <p className="mt-4 text-sm text-fg-faint">Showing up to 100. Use the data admin for edits and exports.</p>
    </div>
  );
}

Users.layout = AppLayout;
export default Users;
