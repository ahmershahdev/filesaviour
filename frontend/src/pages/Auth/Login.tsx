import { Link, useForm } from "@inertiajs/react";

import { Button, Field } from "@/components/ui";
import type { Errors } from "@/types";

import AuthShell from "@/features/auth/AuthShell";

function Login({ errors }: { errors: Errors }) {
  const form = useForm({ email: "", password: "", remember: true });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(window.location.pathname + window.location.search, { preserveScroll: true });
  };
  return (
    <AuthShell title="Welcome back" subtitle={<>New here? <Link href="/account/register" className="text-fg underline decoration-highlight underline-offset-4">Create a free account</Link></>}>
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email" required value={form.data.email}
          onChange={(e) => form.setData("email", e.target.value)} error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required value={form.data.password}
          onChange={(e) => form.setData("password", e.target.value)} error={errors.password} />
        <label className="flex items-center gap-3 text-sm text-fg-muted">
          <input type="checkbox" checked={form.data.remember} onChange={(e) => form.setData("remember", e.target.checked)} className="size-4 accent-[var(--highlight)]" />
          Keep me signed in
        </label>
        <Button type="submit" variant="highlight" disabled={form.processing} className="mt-2">{form.processing ? "Signing in…" : "Log in"}</Button>
      </form>
    </AuthShell>
  );
}

Login.layout = (page: React.ReactNode) => page; // AuthShell is the whole page
export default Login;
