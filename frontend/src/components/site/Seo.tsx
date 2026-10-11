import { Head, usePage } from "@inertiajs/react";

import type { SharedProps } from "@/types";

/**
 * Mirrors the server-rendered <head> (templates/base.html) on client-side
 * navigation. head-key values match the server's data-inertia attributes, so
 * tags are replaced in place rather than duplicated.
 */
export default function Seo() {
  const { meta } = usePage<SharedProps>().props;
  if (!meta) return null;
  return (
    <Head>
      <title>{meta.title}</title>
      <meta head-key="description" name="description" content={meta.description} />
      <meta head-key="robots" name="robots" content={meta.robots} />
      <link head-key="canonical" rel="canonical" href={meta.canonical} />
      <meta head-key="og:type" property="og:type" content={meta.type} />
      <meta head-key="og:title" property="og:title" content={meta.title} />
      <meta head-key="og:description" property="og:description" content={meta.description} />
      <meta head-key="og:url" property="og:url" content={meta.canonical} />
      <meta head-key="og:image" property="og:image" content={meta.image} />
      <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta head-key="twitter:title" name="twitter:title" content={meta.title} />
      <meta head-key="twitter:description" name="twitter:description" content={meta.description} />
      <meta head-key="twitter:image" name="twitter:image" content={meta.image} />
      {meta.jsonld.map((block, i) => (
        <script
          key={i}
          head-key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
        />
      ))}
    </Head>
  );
}
