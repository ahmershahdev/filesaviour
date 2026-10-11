import { router, useForm } from "@inertiajs/react";
import { useState } from "react";

import { Button, Field } from "@/components/ui";
import AppLayout from "@/layouts/AppLayout";
import type { Errors } from "@/types";

type Profile = { name: string; email: string; keep_history: boolean; marketing_opt_in: boolean };

function Settings({ profile, errors }: { profile: Profile; errors: Errors }) {
  const form = useForm({ name: profile.name, keep_history: profile.keep_history, marketing_opt_in: profile.marketing_opt_in });
  const [confirm, setConfirm] = useState("");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Settings</p>
      <h1 className="text-headline mt-3">Your account</h1>

      <form onSubmit={(e) => { e.preventDefault(); form.post("/dashboard/settings", { preserveScroll: true }); }} className="card mt-10 grid gap-6 p-6 md:p-8">
        <Field label="Email" name="email" value={profile.email} disabled hint="Contact support to change your email." />
        <Field label="Display name" name="name" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} error={errors.name} />
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={form.data.keep_history} onChange={(e) => form.setData("keep_history", e.target.checked)} className="mt-1 size-4 accent-[var(--highlight)]" />
          <span><span className="font-medium">Keep results for 7 days</span><span className="block text-sm text-fg-muted">Off: every result is deleted after 1 hour, like for guests.</span></span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={form.data.marketing_opt_in} onChange={(e) => form.setData("marketing_opt_in", e.target.checked)} className="mt-1 size-4 accent-[var(--highlight)]" />
          <span><span className="font-medium">Product updates</span><span className="block text-sm text-fg-muted">At most one email a month about new tools.</span></span>
        </label>
        <Button type="submit" variant="highlight" disabled={form.processing || !form.isDirty} className="justify-self-start">Save changes</Button>
      </form>

      <section className="mt-10 rounded-[var(--radius-card)] border border-coral-400/40 p-6 md:p-8">
        <h2 className="text-title">Delete account</h2>
        <p className="mt-2 text-fg-muted">Your profile, history and stored files are erased immediately. This can't be undone.</p>
        <label className="mt-6 grid gap-2 text-sm">
          Type <span className="font-mono">delete</span> to confirm
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 max-w-xs rounded-xl border border-line bg-surface px-3" />
        </label>
        <Button variant="ghost" className="mt-4 border-coral-400/60 text-coral-400" disabled={confirm !== "delete"} onClick={() => router.post("/account/delete")}>
          Delete my account
        </Button>
      </section>
    </div>
  );
}

Settings.layout = AppLayout;
export default Settings;
