import { Link, useForm } from "@inertiajs/react";
import { Mail, UserRound } from "lucide-react";

import { Checkbox, Field, PasswordField } from "@/components/ui";
import type { Errors } from "@/types";

import AuthShell from "@/features/auth/AuthShell";
import { AltRoute, Row, Submit } from "@/features/auth/parts";

function Register({ errors }: { errors: Errors }) {
  const form = useForm({ name: "", email: "", password: "", accept_terms: false });
  return (
    <AuthShell
      step="02"
      title={<>Create your <span className="serif-em font-normal text-highlight">vault</span>.</>}
      subtitle="Every tool is free. An account adds history and 200 MB uploads."
      statement={<>Forty-two tools.<br /><span className="serif-em font-normal text-highlight">One calm</span><br />workspace.</>}
    >
      <form onSubmit={(e) => { e.preventDefault(); form.post("/account/register"); }} className="grid gap-5" noValidate>
        <Row>
          <Field label="Name" name="name" icon={UserRound} autoComplete="name" placeholder="What should we call you?" autoFocus
            aside={<span className="text-xs text-fg-faint">Optional</span>}
            value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} error={errors.name} />
        </Row>
        <Row>
          <Field label="Email" name="email" type="email" icon={Mail} autoComplete="email" inputMode="email" required placeholder="you@example.com"
            value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} error={errors.email} />
        </Row>
        <Row>
          <PasswordField label="Password" name="password" autoComplete="new-password" required minLength={10} meter
            placeholder="At least 10 characters" value={form.data.password}
            onChange={(e) => form.setData("password", e.target.value)} error={errors.password} />
        </Row>
        <Row>
          <Checkbox checked={form.data.accept_terms} onChange={(e) => form.setData("accept_terms", e.target.checked)}>
            I agree to the <Link href="/terms" className="text-fg underline underline-offset-4">Terms</Link> and{" "}
            <Link href="/privacy" className="text-fg underline underline-offset-4">Privacy Policy</Link>.
          </Checkbox>
          {errors.accept_terms && <p role="alert" className="mt-2 text-sm text-coral-400">{errors.accept_terms}</p>}
        </Row>
        <Row className="mt-2"><Submit busy={form.processing} busyText="Creating your account…">Create account</Submit></Row>
      </form>
      <AltRoute prompt="Already have an account?" href="/account/login" label="Log in instead" />
    </AuthShell>
  );
}

Register.layout = (page: React.ReactNode) => page; // AuthShell is the whole page
export default Register;
