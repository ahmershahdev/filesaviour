import { usePage } from "@inertiajs/react";
import { ArrowUpRight, Bug, Lightbulb, LifeBuoy, ShieldAlert } from "lucide-react";

import type { SharedProps } from "@/types";

export default function Contact() {
  const { site } = usePage<SharedProps>().props;
  const topics = [
    { icon: LifeBuoy, title: "Help with a tool", subject: "Help: ", body: "Tell us the tool, file type and what happened. Don't attach sensitive files." },
    { icon: Bug, title: "Report a bug", subject: "Bug: ", body: "Your browser, device and steps to reproduce help us fix it fast." },
    { icon: Lightbulb, title: "Suggest a tool", subject: "Idea: ", body: "What file job is still painful? We build from these requests." },
    { icon: ShieldAlert, title: "Security report", subject: "Security: ", body: "Responsible disclosure is welcome. See /.well-known/security.txt." },
  ];
  return (
    <div className="shell pt-32 md:pt-40">
      <p className="eyebrow mb-5">Contact</p>
      <h1 className="text-display">Talk to a <span className="serif-em text-highlight">human</span>.</h1>
      <p className="text-lede mt-8 max-w-xl text-fg-muted">
        We reply within two working days. The fastest way is email:{" "}
        <a href={`mailto:${site.supportEmail}`} className="text-fg underline decoration-highlight underline-offset-4">{site.supportEmail}</a>
      </p>
      <div className="mt-16 grid gap-3 sm:grid-cols-2">
        {topics.map((t) => (
          <a key={t.title} href={`mailto:${site.supportEmail}?subject=${encodeURIComponent(t.subject)}`}
            className="card group flex min-h-56 flex-col p-8 transition hover:border-line-strong hover:bg-surface-2">
            <t.icon className="size-6 text-highlight" aria-hidden />
            <h2 className="mt-auto flex items-center gap-2 pt-10 text-2xl">{t.title}<ArrowUpRight className="size-5 opacity-0 transition group-hover:opacity-100" aria-hidden /></h2>
            <p className="mt-2 text-fg-muted">{t.body}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
