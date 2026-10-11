from datetime import date
from urllib.parse import urlsplit

from django.conf import settings
from django.contrib.sitemaps import Sitemap
from django.http import HttpResponse

from apps.blog.models import Post
from apps.tools import registry


class BaseSitemap(Sitemap):
    """Always emit the canonical SITE_URL host, never the request host."""

    def get_domain(self, site=None):
        return urlsplit(settings.SITE_URL).netloc

    def get_protocol(self, protocol=None):
        return urlsplit(settings.SITE_URL).scheme


class StaticSitemap(BaseSitemap):
    changefreq = "monthly"

    def items(self):
        return [
            ("/", 1.0), ("/tools", 0.9), ("/about", 0.5), ("/faq", 0.6), ("/contact", 0.4), ("/blog", 0.6),
            ("/terms", 0.2), ("/privacy", 0.3), ("/cookies", 0.2),
            *((p, 0.8) for p in registry.CATEGORY_PATHS.values()),
        ]

    def location(self, item):
        return item[0]

    def priority(self, item):
        return item[1]


class ToolSitemap(BaseSitemap):
    changefreq = "weekly"

    def items(self):
        return [t for t in registry.TOOLS if t.status != "soon"]

    def location(self, item):
        return item.path

    def priority(self, item):
        return 0.9 if item.status == "live" else 0.7

    def lastmod(self, item):
        return date.fromisoformat(registry.CONTENT_UPDATED)


class BlogSitemap(BaseSitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return Post.objects.published()

    def lastmod(self, obj):
        return obj.updated_at


SITEMAPS = {"pages": StaticSitemap, "tools": ToolSitemap, "blog": BlogSitemap}


def sitemap_index(request):
    """Sitemap index that always points at SITE_URL (Django's uses the request host)."""
    entries = []
    for section in SITEMAPS:
        lastmod = ""
        if section == "tools":
            lastmod = f"<lastmod>{registry.CONTENT_UPDATED}</lastmod>"
        elif section == "blog":
            latest = Post.objects.published().order_by("-updated_at").first()
            if latest is None:
                continue
            lastmod = f"<lastmod>{latest.updated_at.date().isoformat()}</lastmod>"
        entries.append(f"<sitemap><loc>{settings.SITE_URL}/sitemap-{section}.xml</loc>{lastmod}</sitemap>")
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>' + chr(10)
        + '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(entries)
        + "</sitemapindex>" + chr(10)
    )
    return HttpResponse(body, content_type="application/xml")
