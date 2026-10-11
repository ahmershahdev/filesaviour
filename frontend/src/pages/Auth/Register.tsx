import { Link, useForm } from "@inertiajs/react";

import { Button, Field } from "@/components/ui";
import type { Errors } from "@/types";

import AuthShell from "@/components/site/AuthShell";

function Register({ errors }: { errors: Errors }) {
  const form = useForm({ name: "", email: "", password: "", accept_terms: false });
  return (
    <AuthShell title="Create your account" subtitle={<>Already have one? <Link href="/account/login" className="text-fg underline decoration-highlight underline-offset-4">Log in</Link></>}>
      <form onSubmit={(e) => { e.preventDefault(); form.post("/account/register"); }} className="grid gap-5" noValidate>
        <Field label="Name (optional)" name="name" autoComplete="name" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} error={errors.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" required minLength={10} value={form.data.password}
          onChange={(e) => form.setData("password", e.target.value)} error={errors.password} hint="At least 10 characters." />
        <label className="flex items-start gap-3 text-sm text-fg-muted">
          <input type="checkbox" checked={form.data.accept_terms} onChange={(e) => form.setData("accept_terms", e.target.checked)} className="mt-0.5 size-4 accent-[var(--highlight)]" />
          <span>I agree to the <Link href="/terms" className="text-fg underline">Terms</Link> and <Link href="/privacy" className="text-fg underline">Privacy Policy</Link>.</span>
        </label>
        {errors.accept_terms && <p className="text-sm text-coral-400">{errors.accept_terms}</p>}
        <Button type="submit" variant="highlight" disabled={form.processing} className="mt-2">{form.processing ? "Creating…" : "Create account"}</Button>
        <p className="text-xs text-fg-faint">Free forever for the core tools. Unlocks history and {"200 MB"} uploads.</p>
      </form>
    </AuthShell>
  );
}

Register.layout = (page: React.ReactNode) => page; // AuthShell is the whole page
export default Register;
