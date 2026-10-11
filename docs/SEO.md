# FileSaviour — SEO & AI-discoverability

Everything below is generated from `backend/apps/tools/registry.py` and `backend/apps/core/content.py`. Add a tool there and its page, sitemap entry, JSON-LD, OG image, llms.txt line and nav links all appear automatically.

## Rendering

- **`<head>` is always server-rendered by Django** (`templates/base.html`): title, description, canonical, robots, Open Graph, Twitter and JSON-LD. Crawlers never depend on JavaScript for meta.
- **Body:** Inertia SSR in production (`INERTIA_SSR_ENABLED=true`, Node sidecar). The HTML includes the H1, intro, how-to steps and FAQ. If SSR is down, inertia-django falls back to client rendering and the Django `<head>` still ships.
- On client navigation, `<Seo/>` updates the same tags in place (matching `data-inertia` keys, so no duplicates).

## URL strategy

| Pattern | Example | Reason |
|---|---|---|
| `/<intent-slug>` | `/merge-pdf`, `/pdf-to-word`, `/compress-image` | Matches the query verbatim; short; same convention as market leaders |
| `/<category>-tools` | `/pdf-tools` | Hub pages with ItemList schema; internal-link authority to tools |
| `/blog/<slug>` | | Long-tail guides that link to tools (`Post.tools`) |

Canonical = `SITE_URL + path`, always absolute, no query string. `www` redirects to the apex in Caddy.

## Structured data (one `@graph` per page)

| Page | Nodes |
|---|---|
| All | `Organization` (logo, founder), `Person` (author), `WebSite` + `SearchAction` (`/tools?q=`) |
| Home | `WebPage`, `ItemList` of 42 tools |
| Tool | `WebPage` → `WebApplication` (free `Offer`, category, featureList), `HowTo` (3 steps with anchors), `FAQPage`, `BreadcrumbList` |
| Category / Tools | `CollectionPage`, `ItemList`, `BreadcrumbList` |
| FAQ | `FAQPage` (all 12 Q&As) |
| About / Contact | `AboutPage` / `ContactPage` |
| Blog post | `BlogPosting` (dates, wordCount, author, publisher) |

Rules: **no `AggregateRating` or reviews unless real** (tested). Google limits FAQ/HowTo rich results, but the markup still helps Bing and AI answer engines understand the page.

## Files

| URL | Contents |
|---|---|
| `/robots.txt` | Allow all public pages; disallow `/dashboard`, `/console`, `/api/`, `/account/`, search-result URLs. Explicit allow blocks for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended and CCBot (switch any to `Disallow` if you prefer). Sitemap link. Admin path is deliberately **not** listed. |
| `/sitemap.xml` | **One** sitemap (a single `<urlset>`) with static pages, category hubs, tools (`soon` excluded; `lastmod` from `CONTENT_UPDATED`) and published blog posts. Always uses the canonical host. There are no sub-sitemaps. |
| `/llms.txt` | [llmstxt.org](https://llmstxt.org) format: H1, summary blockquote, H2 per category with a link and description per tool, policies, and an `## Optional` section. |
| `/llms-full.txt` | Every tool's intro, I/O formats, runtime and how-to steps, plus the full FAQ, privacy policy and terms in one Markdown file. |
| `/rss.xml` | RSS 2.0 blog feed with `atom:link rel=self`; advertised via `<link rel="alternate">`. |
| `/manifest.webmanifest` | PWA manifest with 192/512 icons and shortcuts to top tools. |
| `/.well-known/security.txt` | RFC 9116 contact. |
| `/og/<slug>.png` | 1200×630 branded OG card per tool (Pillow, cached; pre-render with `manage.py build_brand_assets`). |

## On-page template (tool pages)

H1 = tool name · lede = meta description · workspace above the fold · "What it does" (intro + I/O table) · "How to use" (ordered steps with `#step-n` anchors) · FAQ (4 Q&As) · "Pairs well with" (3 related tools) · breadcrumbs. Titles follow `"{Tool} — Free Online Tool | FileSaviour"`; meta descriptions are ≤ 160 characters (enforced by an assert in the registry).

## Launch checklist

- [ ] Verify the domain in Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`
- [ ] Bump `CONTENT_UPDATED` in the registry whenever tool copy changes
- [ ] Publish 10–20 guides targeting long-tail queries ("how to compress a PDF for email", "heic to jpg on windows"), each linking to its tool
- [ ] Measure Core Web Vitals in Search Console after launch
- [ ] Have `TERMS` / `PRIVACY` in `content.py` reviewed by a lawyer before launch
- [ ] Optional: add localized versions later with `hreflang` (structure supports `/es/...` prefixes)
