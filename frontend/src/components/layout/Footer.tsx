import { Link, usePage } from "@inertiajs/react";
import { ArrowUpRight, Rss } from "lucide-react";

import type { SharedProps } from "@/types";

import { Wordmark } from "@/components/brand/Logo";

export default function Footer() {
  const { catalog, site } = usePage<SharedProps>().props;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line">
      <div className="shell grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Wordmark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg-muted">
            {site.tagline} 42 free tools for PDFs, images and writing. Files stay on your device whenever possible.
          </p>
          <a href={`mailto:${site.supportEmail}`} className="mt-6 inline-flex items-center gap-1.5 text-sm underline decoration-highlight underline-offset-4">
            {site.supportEmail} <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </div>

        {catalog.categories.map((cat) => (
          <nav key={cat.slug} aria-label={cat.name} className="md:col-span-2">
            <h2 className="eyebrow mb-4">
              <Link href={cat.path} className="hover:text-fg">{cat.name}</Link>
            </h2>
            <ul className="grid gap-2 text-sm">
              {catalog.tools.filter((t) => t.category === cat.slug).slice(0, 7).map((t) => (
                <li key={t.slug}>
                  <Link href={t.path} className="text-fg-muted transition hover:text-fg">{t.name}</Link>
                </li>
              ))}
              {cat.count > 7 && (
                <li><Link href={cat.path} className="text-fg-faint hover:text-fg">+{cat.count - 7} more</Link></li>
              )}
            </ul>
          </nav>
        ))}
      </div>

      {/* Oversized wordmark: the closing visual beat on every page */}
      <div aria-hidden className="shell pointer-events-none select-none">
        <p className="outline-type -mb-[0.18em] text-center font-display text-[clamp(4rem,17vw,19rem)] font-bold leading-none tracking-[-0.06em]">
          FileSaviour
        </p>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-4 py-6 text-sm text-fg-faint md:flex-row md:items-center md:justify-between">
          <p>© {year} FileSaviour · Built by <a href="https://ahmershah.dev" className="hover:text-fg">Syed Ahmer Shah</a></p>
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
