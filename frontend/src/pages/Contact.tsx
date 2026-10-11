import { router, useForm, usePage } from "@inertiajs/react";
import { ArrowUpRight, Bug, Check, Clock3, Globe, Lightbulb, LifeBuoy, LoaderCircle, Mail, MessageSquare, Send, ShieldAlert, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { GitHubIcon, LinkedInIcon } from "@/components/brand/Social";
import { Button, Field, Reveal, TextArea } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Errors, SharedProps } from "@/types";

type Topic = { value: string; label: string };

const TOPIC_ICON: Record<string, typeof LifeBuoy> = { help: LifeBuoy, bug: Bug, idea: Lightbulb, security: ShieldAlert, other: MessageSquare };
const MAX = 5000;

export default function Contact({ topics, errors, sent }: { topics: Topic[]; errors: Errors; sent: boolean }) {
  const { site, auth } = usePage<SharedProps>().props;
  const form = useForm({ name: auth.user?.name ?? "", email: auth.user?.email ?? "", topic: "help", body: "", website: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post("/contact", { preserveScroll: true, onSuccess: () => form.reset("body") });
  };

  const links = [
    { href: `mailto:${site.supportEmail}`, label: "Email", value: site.supportEmail, icon: Mail },
    { href: site.linkedin, label: "LinkedIn", value: "in/syedahmershah", icon: LinkedInIcon },
    { href: `${site.source}/issues`, label: "GitHub issues", value: "ahmershahdev/filesaviour", icon: GitHubIcon },
    { href: site.authorUrl, label: "Owner website", value: site.authorUrl.replace(/^https?:\/\//, ""), icon: Globe },
  ];

  return (
    <div className="shell pt-32 md:pt-40">
      <p className="eyebrow mb-5 flex items-center gap-3"><span className="text-highlight">Contact</span><span className="h-px w-8 bg-line-strong" aria-hidden />Reply within 2 working days</p>
      <h1 className="text-display max-w-5xl">Talk to a <span className="serif-em text-highlight">human</span>.</h1>
      <p className="text-lede mt-8 max-w-xl text-fg-muted">
        Questions about a tool, a bug, an idea for the next one, or a security report. Every message is read by the person who builds FileSaviour.
      </p>

      <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-7">
          <div className="card relative overflow-hidden p-5 sm:p-8 md:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="grid min-h-[28rem] content-center justify-items-start gap-6" role="status">
                  <motion.span initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 240, damping: 15, delay: 0.1 }}
                    className="grid size-16 place-items-center rounded-2xl bg-highlight text-highlight-fg">
                    <Check className="size-8 stroke-[2.5]" aria-hidden />
                  </motion.span>
                  <h2 className="text-headline">Message <span className="serif-em font-normal text-highlight">received</span>.</h2>
                  <p className="max-w-md text-fg-muted">Thanks for writing. You'll get a reply at the address you gave within two working days, usually sooner.</p>
                  <Button variant="ghost" onClick={() => router.get("/contact", {}, { preserveScroll: true })}>Send another message</Button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate className="grid gap-6"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium">What's it about?</legend>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => {
                        const Icon = TOPIC_ICON[t.value] ?? MessageSquare;
                        const on = form.data.topic === t.value;
                        return (
                          <label key={t.value} className={cn(
                            "relative inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                            on ? "border-highlight bg-highlight text-highlight-fg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                          )}>
                            <input type="radio" name="topic" value={t.value} checked={on} onChange={() => form.setData("topic", t.value)} className="sr-only" />
                            <Icon className="size-4" aria-hidden />{t.label}
                          </label>
                        );
                      })}
                    </div>
                    {errors.topic && <p role="alert" className="mt-2 text-sm text-coral-400">{errors.topic}</p>}
                  </fieldset>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Your name" name="name" icon={UserRound} autoComplete="name" required maxLength={80} placeholder="Jane Doe"
                      value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} error={errors.name} />
                    <Field label="Email" name="email" type="email" icon={Mail} autoComplete="email" inputMode="email" required placeholder="you@example.com"
                      value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} error={errors.email} />
                  </div>

                  <TextArea label="Message" name="body" required maxLength={MAX} rows={7}
                    placeholder={form.data.topic === "bug"
                      ? "Which tool, which browser, and what happened? Steps to reproduce help a lot."
                      : "Tell us what you need. Please don't paste passwords or attach sensitive files."}
                    value={form.data.body} onChange={(e) => form.setData("body", e.target.value)} error={errors.body}
                    aside={<span className={cn("font-mono text-xs tabular-nums", form.data.body.length > MAX * 0.9 ? "text-coral-400" : "text-fg-faint")}>{form.data.body.length}/{MAX}</span>} />

                  {/* Honeypot: off-screen for people, tempting for bots */}
                  <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" placeholder="https://"
                      value={form.data.website} onChange={(e) => form.setData("website", e.target.value)} /></label>
                  </div>

                  <div className="flex flex-col-reverse items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                    <p className="text-xs text-fg-faint">We only use your email to reply. See the <a href="/privacy" className="underline underline-offset-2 hover:text-fg">privacy policy</a>.</p>
                    <Button type="submit" variant="highlight" disabled={form.processing} className="group w-full sm:w-auto">
                      {form.processing ? <><LoaderCircle className="size-4 animate-spin" aria-hidden />Sending…</>
                        : <>Send message<Send className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></>}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        <aside className="grid content-start gap-6 lg:col-span-5">
          <Reveal delay={0.08}>
            <div className="card p-6 md:p-8">
              <p className="eyebrow">Reach us directly</p>
              <ul className="mt-6 grid divide-y divide-line">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                      className="group flex items-center gap-4 py-3.5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-fg-muted transition group-hover:border-highlight group-hover:text-highlight">
                        <l.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-fg-faint">{l.label}</span>
                        <span className="block truncate font-medium">{l.value}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-fg-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="bg-bg p-6">
                <Clock3 className="size-5 text-highlight" aria-hidden />
                <p className="mt-6 font-display text-4xl font-semibold tracking-tight">≤ 2 days</p>
                <p className="mt-1 text-sm text-fg-muted">Typical reply time, Monday to Friday.</p>
              </div>
              <div className="bg-bg p-6">
                <ShieldAlert className="size-5 text-highlight" aria-hidden />
                <p className="mt-6 font-display text-xl font-semibold">Security issue?</p>
                <p className="mt-1 text-sm text-fg-muted">
                  Choose “Security report”. Disclosure policy: <a href="/.well-known/security.txt" className="underline underline-offset-2 hover:text-fg">security.txt</a>.
                </p>
              </div>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
