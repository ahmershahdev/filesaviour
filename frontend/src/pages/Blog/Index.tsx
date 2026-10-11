import { Link } from "@inertiajs/react";
import { ArrowUpRight, Rss } from "lucide-react";

type Post = { title: string; slug: string; excerpt: string; path: string; publishedAt: string; readingMinutes: number; cover: string | null };

export default function BlogIndex({ posts }: { posts: Post[] }) {
  return (
    <div className="shell pt-32 md:pt-40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-5">Journal</p>
          <h1 className="text-display">Guides <span className="serif-em text-fg-muted">& notes</span></h1>
        </div>
        <a href="/rss.xml" className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"><Rss className="size-4" aria-hidden />RSS feed</a>
      </div>
      {posts.length ? (
        <ul className="mt-16 border-t border-line">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={p.path} className="group grid gap-3 border-b border-line py-8 md:grid-cols-12 md:items-baseline">
                <time dateTime={p.publishedAt} className="font-mono text-xs text-fg-faint md:col-span-2">{new Date(p.publishedAt).toLocaleDateString("en", { dateStyle: "medium" })}</time>
                <h2 className="text-title transition-transform duration-500 group-hover:translate-x-2 md:col-span-6">{p.title}</h2>
                <p className="text-fg-muted md:col-span-3">{p.excerpt}</p>
                <ArrowUpRight className="hidden size-5 justify-self-end md:block" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lede mt-16 text-fg-muted">The first guides are being written. Subscribe to the RSS feed to catch them.</p>
      )}
    </div>
  );
}
