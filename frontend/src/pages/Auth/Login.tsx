import { Link, useForm } from "@inertiajs/react";
import { Mail } from "lucide-react";

import { Checkbox, Field, PasswordField } from "@/components/ui";
import type { Errors } from "@/types";

import AuthShell from "@/features/auth/AuthShell";
import { AltRoute, Row, Submit } from "@/features/auth/parts";

function Login({ errors }: { errors: Errors }) {
  const form = useForm({ email: "", password: "", remember: true });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(window.location.pathname + window.location.search, { preserveScroll: true, onFinish: () => form.reset("password") });
  };
  return (
    <AuthShell
      step="01"
      title={<>Welcome <span className="serif-em font-normal text-highlight">back</span>.</>}
      subtitle="Log in to see your history, keep results for 7 days and upload up to 200 MB."
      statement={<>Pick up<br /><span className="serif-em font-normal text-highlight">right where</span><br />you left off.</>}
    >
      <form onSubmit={submit} className="grid gap-5" noValidate>
        <Row>
          <Field label="Email" name="email" type="email" icon={Mail} autoComplete="email" inputMode="email" required autoFocus
            placeholder="you@example.com" value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} error={errors.email} />
        </Row>
        <Row>
          <PasswordField label="Password" name="password" autoComplete="current-password" required placeholder="Enter your password"
            value={form.data.password} onChange={(e) => form.setData("password", e.target.value)} error={errors.password}
            aside={<Link href="/account/forgot-password" className="text-sm text-fg-muted underline-offset-4 transition hover:text-fg hover:underline">Forgot password?</Link>} />
        </Row>
        <Row>
          <Checkbox checked={form.data.remember} onChange={(e) => form.setData("remember", e.target.checked)}>Keep me signed in on this device</Checkbox>
        </Row>
        <Row className="mt-2"><Submit busy={form.processing} busyText="Signing in…">Log in</Submit></Row>
      </form>
      <AltRoute prompt="New to FileSaviour?" href="/account/register" label="Create a free account" />
    </AuthShell>
  );
}

Login.layout = (page: React.ReactNode) => page; // AuthShell is the whole page
export default Login;
