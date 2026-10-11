from django.conf import settings
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path
from django.views.decorators.cache import cache_page
from django.views.generic import RedirectView

from apps.blog import views as blog
from apps.console import views as console
from apps.core import og
from apps.core import views as core
from apps.core.sitemaps import SITEMAPS
from apps.tools import registry
from apps.tools import views as tools

DAY = 60 * 60 * 24

core_patterns = (
    [
        path("", core.home, name="home"),
        path("about", core.about, name="about"),
        path("faq", core.faq, name="faq"),
        path("terms", core.terms, name="terms"),
        path("privacy", core.privacy, name="privacy"),
        path("cookies", core.cookies, name="cookies"),
    ],
    "core",
)

blog_patterns = (
    [
        path("blog", blog.index, name="index"),
        path("blog/<slug:slug>", blog.show, name="show"),
    ],
    "blog",
)

seo_files = [
    path("robots.txt", core.robots_txt),
    path("llms.txt", core.llms_txt),
    path("llms-full.txt", core.llms_full_txt),
    path(".well-known/security.txt", core.security_txt),
    path("manifest.webmanifest", core.manifest),
    path("og/<slug:slug>.png", og.tool_og, name="og-tool"),
    path("favicon.ico", RedirectView.as_view(url="/static/brand/favicon.ico", permanent=True)),
    path("rss.xml", blog.LatestPostsFeed(), name="rss"),
    path("sitemap.xml", cache_page(DAY)(sitemap), {"sitemaps": SITEMAPS}, name="sitemap"),
]

category_routes = [
    path(p.lstrip("/"), tools.category, {"slug": slug}, name=f"category-{slug}")
    for slug, p in registry.CATEGORY_PATHS.items()
]

urlpatterns = [
    *seo_files,
    path("", include(core_patterns)),
    path("", include(blog_patterns)),
    path("", include("apps.accounts.urls")),
    path("", include("apps.contact.urls")),
    path("", include("apps.jobs.urls")),
    path("console", console.overview, name="console"),
    path("console/users", console.users, name="console-users"),
    path(settings.DJANGO_ADMIN_PATH, admin.site.urls),
    path("tools", tools.index, name="tools"),
    *category_routes,
    # Tool pages live at the root (/merge-pdf) to match search intent. Keep last.
    path("<slug:slug>", tools.detail, name="tool"),
]

handler404 = "apps.core.views.not_found"

admin.site.site_header = "FileSaviour vault"
admin.site.site_title = "FileSaviour admin"
