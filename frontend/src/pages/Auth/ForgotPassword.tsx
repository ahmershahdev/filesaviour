import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { motion } from "motion/react";

import { Field } from "@/components/ui";
import type { Errors } from "@/types";

import AuthShell from "@/features/auth/AuthShell";
import { Row, Submit } from "@/features/auth/parts";

const STATEMENT = <>Locked out?<br /><span className="serif-em font-normal text-highlight">We'll get you</span><br />back in.</>;

function ForgotPassword({ errors, sentTo }: { errors: Errors; sentTo: string | null }) {
  const form = useForm({ email: sentTo ?? "" });
  const send = () => form.post("/account/forgot-password");

  if (sentTo) {
    return (
      <AuthShell
        step="03"
        title={<>Check your <span className="serif-em font-normal text-highlight">inbox</span>.</>}
        subtitle={<>If an account exists for <span className="font-medium text-fg">{sentTo}</span>, a reset link is on its way. It works for one hour.</>}
        statement={STATEMENT}
      >
        <Row>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.35 }}
            className="grid size-16 place-items-center rounded-2xl border border-line-strong bg-surface-2 text-highlight"
          >
            <MailCheck className="size-7" aria-hidden />
          </motion.div>
        </Row>
        <Row className="mt-8 grid gap-3 text-sm text-fg-muted">
          <p>Nothing yet? Check your spam folder, or wait a minute and send it again.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={send} disabled={form.processing}
              className="h-11 rounded-full border border-line-strong px-5 font-medium text-fg transition hover:bg-surface-2 disabled:opacity-50">
              {form.processing ? "Sending…" : "Send again"}
            </button>
            <Link href="/account/login" className="flex h-11 items-center gap-2 rounded-full px-5 font-medium text-fg-muted transition hover:text-fg">
              <ArrowLeft className="size-4" aria-hidden />Back to log in
            </Link>
          </div>
        </Row>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      step="03"
      title={<>Forgot your <span className="serif-em font-normal text-highlight">password</span>?</>}
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new one."
      statement={STATEMENT}
    >
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="grid gap-5" noValidate>
        <Row>
          <Field label="Email" name="email" type="email" icon={Mail} autoComplete="email" inputMode="email" required autoFocus
            placeholder="you@example.com" value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} error={errors.email} />
        </Row>
        <Row className="mt-2"><Submit busy={form.processing} busyText="Sending link…">Send reset link</Submit></Row>
      </form>
      <Row className="mt-8 text-center">
        <Link href="/account/login" className="inline-flex items-center gap-2 text-sm text-fg-muted transition hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />Remembered it? Back to log in
        </Link>
      </Row>
    </AuthShell>
  );
}

ForgotPassword.layout = (page: React.ReactNode) => page; // AuthShell is the whole page
export default ForgotPassword;
