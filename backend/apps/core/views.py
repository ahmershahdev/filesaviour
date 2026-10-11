from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET

from apps.tools import registry

from . import content, seo
from .render import page

DAY = 60 * 60 * 24


def home(request):
    title = "FileSaviour — 42 Free PDF, Image & AI Tools in One Place"
    meta = seo.Meta(
        title=title,
        description=settings.SITE_DESCRIPTION,
        path="/",
        jsonld=seo.site_graph(
            seo.webpage("WebPage", title, settings.SITE_DESCRIPTION, "/"),
            seo.item_list("FileSaviour tools", "/", registry.TOOLS),
        ),
    )
    featured = ["merge-pdf", "compress-pdf", "pdf-to-word", "compress-image", "remove-background", "ai-summarizer"]
    return page(request, "Home", meta, featured=[registry.get(s).to_card() for s in featured])


def about(request):
    title = "About FileSaviour — Why We Built a Calmer File Toolkit"
    desc = "FileSaviour is an independent toolkit by Syed Ahmer Shah. It keeps your files on your device whenever possible and deletes everything else within an hour."
    meta = seo.Meta(title=title, description=desc, path="/about",
                    jsonld=seo.site_graph(seo.webpage("AboutPage", title, desc, "/about"), seo.breadcrumbs(("About", "/about"))))
    return page(request, "About", meta)


def faq(request):
    title = "FAQ — Files, Privacy, Limits & Tools | FileSaviour"
    desc = "Answers about how FileSaviour handles your files, file size limits, accounts, AI tools and supported browsers."
    meta = seo.Meta(title=title, description=desc, path="/faq",
                    jsonld=seo.site_graph(seo.webpage("WebPage", title, desc, "/faq"),
                                          seo.faq_page(content.faq_flat(), "/faq"),
                                          seo.breadcrumbs(("FAQ", "/faq"))))
    return page(request, "Faq", meta, groups=content.FAQ_GROUPS)


def _legal(request, doc: dict, path: str):
    title = f"{doc['title']} | FileSaviour"
    meta = seo.Meta(title=title, description=doc["intro"][:155], path=path, modified=doc["updated"],
                    jsonld=seo.site_graph(seo.webpage("WebPage", title, doc["intro"], path),
                                          seo.breadcrumbs((doc["title"], path))))
    return page(request, "Legal", meta, doc=doc)


def terms(request):
    return _legal(request, content.TERMS, "/terms")


def privacy(request):
    return _legal(request, content.PRIVACY, "/privacy")


def cookies(request):
    return _legal(request, content.COOKIES, "/cookies")



def not_found(request, exception=None):
    return page(request, "Errors/NotFound", seo.noindex("Page not found", request.path), status=404)


# --------------------------------------------------------------- text endpoints

@require_GET
@cache_page(DAY)
def robots_txt(request):
    lines = [
        "# FileSaviour — https://filesaviour.ahmershah.dev",
        "User-agent: *",
        "Allow: /",
        "Disallow: /dashboard",
        "Disallow: /console",
        "Disallow: /api/",
        "Disallow: /account/",
        "Disallow: /*?*q=",
        "",
        "# AI answer engines and assistants may read public pages and llms.txt.",
        "# Change Allow to Disallow for any bot you don't want.",
    ]
    for bot in ("GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot",
                "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"):
        lines += [f"User-agent: {bot}", "Allow: /", "Disallow: /dashboard", "Disallow: /console", "Disallow: /api/", ""]
    lines += [f"Sitemap: {settings.SITE_URL}/sitemap.xml", ""]
    return HttpResponse("\n".join(lines), content_type="text/plain; charset=utf-8")


def _tool_line(t) -> str:
    flag = {"beta": " (beta)", "soon": " (coming soon)"}.get(t.status, "")
    return f"- [{t.name}]({seo.absolute(t.path)}){flag}: {t.summary}"


@require_GET
@cache_page(DAY)
def llms_txt(request):
    """https://llmstxt.org — concise, link-first map of the site for LLMs."""
    out = [
        f"# {settings.SITE_NAME}",
        "",
        f"> {settings.SITE_DESCRIPTION} Free to use without an account. Browser tools never upload files; "
        "server and AI tools delete files within one hour.",
        "",
        "FileSaviour has 42 tools in four categories. Each tool lives at a short URL "
        f"({settings.SITE_URL}/<tool-slug>). Tools marked “in browser” process files locally with WebAssembly/Canvas.",
        "",
    ]
    for cat in registry.CATEGORIES:
        out.append(f"## {cat.name}")
        out.append("")
        out += [_tool_line(t) for t in registry.in_category(cat.slug)]
        out.append("")
    out += [
        "## Help & policies",
        "",
        f"- [FAQ]({settings.SITE_URL}/faq): files, privacy, limits, accounts",
        f"- [Privacy Policy]({settings.SITE_URL}/privacy): retention and processors",
        f"- [Terms of Service]({settings.SITE_URL}/terms)",
        f"- [About]({settings.SITE_URL}/about)",
        "",
        "## Optional",
        "",
        f"- [Full text for LLMs]({settings.SITE_URL}/llms-full.txt): every tool's description, steps and FAQ in one file",
        f"- [Blog RSS]({settings.SITE_URL}/rss.xml)",
        f"- [Sitemap]({settings.SITE_URL}/sitemap.xml)",
        "",
    ]
    return HttpResponse("\n".join(out), content_type="text/markdown; charset=utf-8")


@require_GET
@cache_page(DAY)
def llms_full_txt(request):
    out = [
        f"# {settings.SITE_NAME} — full reference",
        "",
        f"> {settings.SITE_DESCRIPTION}",
        "",
        "## How processing works",
        "",
        *(f"- **{k}**: {v}" for k, v in registry.RUNTIME_COPY.items()),
        "",
    ]
    for cat in registry.CATEGORIES:
        out += [f"## {cat.name}", "", cat.description, ""]
        for t in registry.in_category(cat.slug):
            accepts = ", ".join(a.lstrip(".").upper() for a in t.accepts)
            out += [
                f"### {t.name}",
                "",
                f"URL: {seo.absolute(t.path)}  ",
                f"Status: {t.status} · Runs: {t.runtime} · Input: {accepts} · Output: {t.output}",
                "",
                t.intro,
                "",
                *(f"{i}. **{s['name']}**: {s['text']}" for i, s in enumerate(registry.howto_steps(t), 1)),
                "",
            ]
            if t.notice:
                out += [f"Note: {t.notice}", ""]
    out += ["## Frequently asked questions", ""]
    for group in content.FAQ_GROUPS:
        out += [f"### {group['title']}", ""]
        for item in group["items"]:
            out += [f"**{item['q']}**  ", item["a"], ""]
    for doc in (content.PRIVACY, content.TERMS):
        out += [f"## {doc['title']} (updated {doc['updated']})", "", doc["intro"], ""]
        for s in doc["sections"]:
            out += [f"### {s['heading']}", "", *s["body"], ""]
    return HttpResponse("\n".join(out), content_type="text/markdown; charset=utf-8")


@require_GET
@cache_page(DAY)
def security_txt(request):
    body = (
        f"Contact: mailto:{settings.SUPPORT_EMAIL}\n"
        "Expires: 2027-10-11T00:00:00.000Z\n"
        "Preferred-Languages: en\n"
        f"Canonical: {settings.SITE_URL}/.well-known/security.txt\n"
        f"Policy: {settings.SITE_URL}/terms#acceptable-use\n"
    )
    return HttpResponse(body, content_type="text/plain; charset=utf-8")


@require_GET
@cache_page(DAY)
def manifest(request):
    return JsonResponse({
        "name": "FileSaviour",
        "short_name": "FileSaviour",
        "description": settings.SITE_DESCRIPTION,
        "start_url": "/?source=pwa",
        "scope": "/",
        "display": "standalone",
        "background_color": "#05070D",
        "theme_color": "#05070D",
        "icons": [
            {"src": "/static/brand/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/static/brand/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/static/brand/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
            {"src": "/static/brand/favicon.svg", "sizes": "any", "type": "image/svg+xml"},
        ],
        "shortcuts": [
            {"name": t.name, "url": t.path} for t in (registry.get(s) for s in ("merge-pdf", "compress-pdf", "compress-image", "word-counter"))
        ],
    }, content_type="application/manifest+json")
