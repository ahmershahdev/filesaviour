import { Link, usePage } from "@inertiajs/react";
import { ArrowUpRight, Globe, Mail, Rss } from "lucide-react";

import type { SharedProps } from "@/types";

import { Wordmark } from "@/components/brand/Logo";
import { GitHubIcon, LinkedInIcon } from "@/components/brand/Social";

export default function Footer() {
  const { catalog, site } = usePage<SharedProps>().props;
  const onContact = usePage().url.startsWith("/contact");
  const year = new Date().getFullYear();
  const connect = [
    { href: site.linkedin, label: "LinkedIn", icon: LinkedInIcon },
    { href: site.source, label: "Source code", icon: GitHubIcon },
    { href: site.authorUrl, label: "Owner website", icon: Globe },
    { href: `mailto:${site.supportEmail}`, label: "Email us", icon: Mail },
  ];

  return (
    <footer className="relative mt-32 border-t border-line">
      {/* Closing call to action (redundant on the contact page itself) */}
      {!onContact && <div className="shell flex flex-col gap-8 border-b border-line py-14 md:flex-row md:items-end md:justify-between md:py-20">
        <h2 className="max-w-3xl font-display text-[clamp(2.25rem,1.4rem+3.6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
          Questions, ideas or <span className="serif-em font-normal text-highlight">a bug</span>? We read everything.
        </h2>
        <Link href="/contact" className="group inline-flex h-14 shrink-0 items-center gap-3 self-start rounded-full bg-highlight pl-7 pr-2 font-medium text-highlight-fg transition hover:brightness-105 md:self-auto">
          Get in touch
          <span className="grid size-10 place-items-center rounded-full bg-highlight-fg text-highlight transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </Link>
      </div>}

      <div className="shell grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Wordmark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg-muted">
            {site.tagline} 42 free tools for PDFs, images and writing. Files stay on your device whenever possible.
          </p>
          <a href={`mailto:${site.supportEmail}`} className="mt-6 inline-flex items-center gap-1.5 text-sm underline decoration-highlight underline-offset-4">
            {site.supportEmail} <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
          <div className="mt-6 flex gap-2">
            {connect.slice(0, 3).map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener" aria-label={c.label}
                className="grid size-10 place-items-center rounded-full border border-line text-fg-muted transition hover:-translate-y-0.5 hover:border-line-strong hover:text-fg">
                <c.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
          {catalog.categories.map((cat) => (
            <nav key={cat.slug} aria-label={cat.name}>
              <h2 className="eyebrow mb-4">
                <Link href={cat.path} className="hover:text-fg">{cat.short}</Link>
              </h2>
              <ul className="grid gap-2.5 text-sm">
                {catalog.tools.filter((t) => t.category === cat.slug).slice(0, 6).map((t) => (
                  <li key={t.slug}>
                    <Link href={t.path} className="text-fg-muted transition hover:text-fg">{t.name}</Link>
                  </li>
                ))}
                {cat.count > 6 && (
                  <li><Link href={cat.path} className="text-fg-faint hover:text-fg">+{cat.count - 6} more</Link></li>
                )}
              </ul>
            </nav>
          ))}

          <nav aria-label="Connect">
            <h2 className="eyebrow mb-4">Connect</h2>
            <ul className="grid gap-2.5 text-sm">
              {connect.map((c) => (
                <li key={c.label}>
                  <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                    className="group inline-flex items-center gap-2 text-fg-muted transition hover:text-fg">
                    <c.icon className="size-3.5 shrink-0" />
                    <span>{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-4 py-6 text-sm text-fg-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {year} FileSaviour · MIT licensed · Built by{" "}
            <a href={site.authorUrl} target="_blank" rel="noopener" className="text-fg-muted hover:text-fg">{site.author}</a>
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about" className="hover:text-fg">About</Link>
            <Link href="/faq" className="hover:text-fg">FAQ</Link>
            <Link href="/blog" className="hover:text-fg">Blog</Link>
            <Link href="/contact" className="hover:text-fg">Contact</Link>
            <Link href="/privacy" className="hover:text-fg">Privacy</Link>
            <Link href="/terms" className="hover:text-fg">Terms</Link>
            <Link href="/cookies" className="hover:text-fg">Cookies</Link>
            <a href="/rss.xml" className="inline-flex items-center gap-1 hover:text-fg"><Rss className="size-3.5" aria-hidden />RSS</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
