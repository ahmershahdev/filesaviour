import { Link, useForm } from "@inertiajs/react";
import { Link2Off } from "lucide-react";

import { ButtonLink, PasswordField } from "@/components/ui";
import type { Errors } from "@/types";

import AuthShell from "@/features/auth/AuthShell";
import { Row, Submit } from "@/features/auth/parts";

const STATEMENT = <>A fresh key<br /><span className="serif-em font-normal text-highlight">for your</span><br />vault.</>;

function ResetPassword({ valid, email, errors }: { valid: boolean; email: string; errors: Errors }) {
  const form = useForm({ password: "", confirm: "" });
  const mismatch = form.data.confirm.length > 0 && form.data.confirm !== form.data.password;

  if (!valid) {
    return (
      <AuthShell
        step="04"
        title={<>This link has <span className="serif-em font-normal text-highlight">expired</span>.</>}
        subtitle="Reset links work once, for one hour. Request a new one and use the most recent email."
        statement={STATEMENT}
      >
        <Row>
          <div className="grid size-16 place-items-center rounded-2xl border border-line-strong bg-surface-2 text-coral-400">
            <Link2Off className="size-7" aria-hidden />
          </div>
        </Row>
        <Row className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/account/forgot-password" variant="highlight">Send a new link</ButtonLink>
          <ButtonLink href="/account/login" variant="ghost">Back to log in</ButtonLink>
        </Row>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      step="04"
      title={<>Choose a new <span className="serif-em font-normal text-highlight">password</span>.</>}
      subtitle={<>For <span className="font-medium text-fg">{email}</span>. You'll be signed in straight after.</>}
      statement={STATEMENT}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!mismatch) form.post(window.location.pathname);
        }}
        className="grid gap-5"
        noValidate
      >
        {/* Lets password managers attach the new password to the right account */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <Row>
          <PasswordField label="New password" name="password" autoComplete="new-password" required minLength={10} meter autoFocus
            placeholder="At least 10 characters" value={form.data.password}
            onChange={(e) => form.setData("password", e.target.value)} error={errors.password} />
        </Row>
        <Row>
          <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" required placeholder="Type it once more"
            value={form.data.confirm} onChange={(e) => form.setData("confirm", e.target.value)}
            error={mismatch ? "Passwords don't match yet." : undefined} />
        </Row>
        <Row className="mt-2"><Submit busy={form.processing} busyText="Saving…">Set new password</Submit></Row>
      </form>
      <Row className="mt-8 text-center text-sm text-fg-muted">
        <Link href="/account/login" className="transition hover:text-fg">Cancel and go back to log in</Link>
      </Row>
    </AuthShell>
  );
}

ResetPassword.layout = (page: React.ReactNode) => page; // AuthShell is the whole page
export default ResetPassword;
