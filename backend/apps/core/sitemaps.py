from datetime import date
from urllib.parse import urlsplit

from django.conf import settings
from django.contrib.sitemaps import Sitemap

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


# Served as one /sitemap.xml (a single urlset): ~60 URLs is far below the 50k limit,
# so an index plus per-section files would only add requests for crawlers.
SITEMAPS = {"pages": StaticSitemap, "tools": ToolSitemap, "blog": BlogSitemap}
