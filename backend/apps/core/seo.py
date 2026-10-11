"""
SEO primitives: per-page meta and schema.org JSON-LD builders.

Every view returns a `Meta`. It is rendered server-side into <head> by
templates/base.html (so crawlers get full meta without executing JS) and also
passed to React as the `meta` prop so <Head> keeps it in sync on client-side
navigation.

Rules we follow:
  * One canonical per URL, always absolute, no query string.
  * No fabricated ratings/reviews in schema (Google manual-action risk).
  * FAQPage / HowTo are emitted for AI answer engines and Bing; Google only
    shows FAQ rich results for authoritative gov/health sites since 2023.
"""

from dataclasses import dataclass, field

from django.conf import settings

ORG_ID = f"{settings.SITE_URL}/#organization"
SITE_ID = f"{settings.SITE_URL}/#website"
AUTHOR_ID = f"{settings.SITE_URL}/#author"


def absolute(path: str) -> str:
    if path.startswith("http"):
        return path
    return f"{settings.SITE_URL}{path if path.startswith('/') else '/' + path}"


@dataclass
class Meta:
    title: str
    description: str
    path: str
    image: str = "/static/brand/og-default.png"
    type: str = "website"
    robots: str = "index,follow,max-image-preview:large"
    jsonld: list[dict] = field(default_factory=list)
    published: str | None = None
    modified: str | None = None

    def as_dict(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "canonical": absolute(self.path),
            "image": absolute(self.image),
            "type": self.type,
            "robots": self.robots,
            "published": self.published,
            "modified": self.modified,
            "jsonld": self.jsonld,
        }


def noindex(title: str, path: str) -> Meta:
    return Meta(title=f"{title} | FileSaviour", description=settings.SITE_DESCRIPTION, path=path, robots="noindex,nofollow")


# ---------------------------------------------------------------- graph nodes

def organization() -> dict:
    return {
        "@type": "Organization",
        "@id": ORG_ID,
        "name": settings.SITE_NAME,
        "url": settings.SITE_URL,
        "logo": {"@type": "ImageObject", "url": absolute("/static/brand/logo.png"), "width": 512, "height": 496},
        "email": settings.SUPPORT_EMAIL,
        "founder": {"@id": AUTHOR_ID},
        "sameAs": [settings.SITE_AUTHOR_URL],
    }


def author() -> dict:
    return {"@type": "Person", "@id": AUTHOR_ID, "name": settings.SITE_AUTHOR, "url": settings.SITE_AUTHOR_URL}


def website() -> dict:
    return {
        "@type": "WebSite",
        "@id": SITE_ID,
        "url": settings.SITE_URL,
        "name": settings.SITE_NAME,
        "description": settings.SITE_DESCRIPTION,
        "publisher": {"@id": ORG_ID},
        "inLanguage": "en",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {"@type": "EntryPoint", "urlTemplate": f"{settings.SITE_URL}/tools?q={{search_term_string}}"},
            "query-input": "required name=search_term_string",
        },
    }


def breadcrumbs(*crumbs: tuple[str, str]) -> dict:
    items = [("Home", "/"), *crumbs]
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": absolute(path)}
            for i, (name, path) in enumerate(items, start=1)
        ],
    }


def webpage(kind: str, meta_title: str, description: str, path: str) -> dict:
    return {
        "@type": kind,
        "@id": f"{absolute(path)}#webpage",
        "url": absolute(path),
        "name": meta_title,
        "description": description,
        "isPartOf": {"@id": SITE_ID},
        "inLanguage": "en",
    }


def faq_page(items: list[dict], path: str) -> dict:
    return {
        "@type": "FAQPage",
        "@id": f"{absolute(path)}#faq",
        "mainEntity": [
            {"@type": "Question", "name": i["q"], "acceptedAnswer": {"@type": "Answer", "text": i["a"]}}
            for i in items
        ],
    }


def graph(*nodes: dict) -> dict:
    return {"@context": "https://schema.org", "@graph": [n for n in nodes if n]}


# ---------------------------------------------------------- page-level builders

def site_graph(*nodes: dict) -> list[dict]:
    """Organization + WebSite are on every page; extra nodes are page-specific."""
    return [graph(organization(), author(), website(), *nodes)]


def tool_jsonld(tool, category, category_path: str, steps: list[dict], faqs: list[dict]) -> list[dict]:
    from apps.tools.registry import RUNTIME_COPY

    url = absolute(tool.path)
    app = {
        "@type": "WebApplication",
        "@id": f"{url}#app",
        "name": f"FileSaviour {tool.name}",
        "url": url,
        "description": tool.summary,
        "applicationCategory": "UtilitiesApplication" if tool.category != "ai" else "ProductivityApplication",
        "applicationSubCategory": category.name,
        "operatingSystem": "Any (web browser)",
        "browserRequirements": "Requires JavaScript and a modern browser",
        "isAccessibleForFree": True,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "featureList": [tool.intro, RUNTIME_COPY[tool.runtime]],
        "publisher": {"@id": ORG_ID},
        "keywords": ", ".join(tool.keywords),
    }
    howto = {
        "@type": "HowTo",
        "@id": f"{url}#howto",
        "name": f"How to use {tool.name}",
        "totalTime": "PT1M",
        "tool": {"@type": "HowToTool", "name": f"FileSaviour {tool.name}"},
        "step": [
            {"@type": "HowToStep", "position": i, "name": s["name"], "text": s["text"], "url": f"{url}#step-{i}"}
            for i, s in enumerate(steps, start=1)
        ],
    }
    page = webpage("WebPage", tool.title, tool.summary, tool.path)
    page["mainEntity"] = {"@id": app["@id"]}
    return site_graph(
        page,
        app,
        howto,
        faq_page(faqs, tool.path),
        breadcrumbs(("Tools", "/tools"), (category.name, category_path), (tool.name, tool.path)),
    )


def item_list(name: str, path: str, tools) -> dict:
    return {
        "@type": "ItemList",
        "@id": f"{absolute(path)}#list",
        "name": name,
        "numberOfItems": len(tools),
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": t.name, "url": absolute(t.path)}
            for i, t in enumerate(tools, start=1)
        ],
    }
