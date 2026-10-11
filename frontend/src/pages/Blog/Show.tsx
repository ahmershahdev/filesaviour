import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import { ToolCard } from "@/components/tool/ToolCard";
import type { ToolCard as ToolCardType } from "@/types";

type Post = { title: string; excerpt: string; publishedAt: string; readingMinutes: number; cover: string | null; body: string };

/**
 * Body is Markdown authored by staff in the admin. Rendered as plain
 * paragraphs here; swap in a sanitising Markdown renderer when posts need rich formatting.
 */
export default function BlogShow({ post, tools }: { post: Post; tools: ToolCardType[] }) {
  return (
    <article className="shell pt-32 md:pt-40">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"><ArrowLeft className="size-4" aria-hidden />All posts</Link>
      <header className="mt-10 max-w-4xl">
        <p className="eyebrow mb-5">
          <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("en", { dateStyle: "long" })}</time> · {post.readingMinutes} min read
        </p>
        <h1 className="text-display">{post.title}</h1>
        <p className="text-lede mt-6 text-fg-muted">{post.excerpt}</p>
      </header>
      {post.cover && <img src={post.cover} alt="" className="mt-14 aspect-[16/8] w-full rounded-[var(--radius-card)] object-cover" />}
      <div className="prose-fs mx-auto mt-16 max-w-2xl text-lg">
        {post.body.split(/\n{2,}/).map((para, i) =>
          para.startsWith("## ") ? <h2 key={i}>{para.slice(3)}</h2> : <p key={i}>{para}</p>,
        )}
      </div>
      {tools.length > 0 && (
        <aside className="mt-24">
          <h2 className="eyebrow mb-6">Tools in this guide</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tools.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
        </aside>
      )}
    </article>
  );
}
