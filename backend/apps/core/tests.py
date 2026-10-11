import json
import re

from django.conf import settings
from django.test import TestCase, override_settings

from apps.tools import registry

# Tests render templates without a Vite build.
VITE_DEV = {"default": {"dev_mode": True, "dev_server_port": 5173}}


@override_settings(DJANGO_VITE=VITE_DEV, ALLOWED_HOSTS=["testserver"])
class SeoContractTests(TestCase):
    """The SEO surface is a contract: break it and rankings break silently."""

    def test_every_public_page_has_one_canonical_title_and_jsonld(self):
        paths = ["/", "/tools", "/about", "/faq", "/terms", "/privacy", "/cookies", "/contact", "/blog",
                 *registry.CATEGORY_PATHS.values(), *(t.path for t in registry.TOOLS)]
        for path in paths:
            with self.subTest(path=path):
                html = self.client.get(path).content.decode()
                self.assertEqual(html.count("<title"), 1)
                self.assertNotIn("{#", html)  # Django {# #} is single-line only; never leak template comments
                canonicals = re.findall(r'rel="canonical" href="([^"]+)"', html)
                self.assertEqual(canonicals, [f"{settings.SITE_URL}{path}"])
                blocks = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S)
                self.assertTrue(blocks)
                for b in blocks:
                    json.loads(b)  # must be valid JSON

    def test_tool_page_schema(self):
        html = self.client.get("/merge-pdf").content.decode()
        data = json.loads(re.search(r'application/ld\+json[^>]*>(.*?)</script>', html, re.S).group(1))
        types = {n["@type"] for n in data["@graph"]}
        self.assertTrue({"WebApplication", "HowTo", "FAQPage", "BreadcrumbList", "Organization", "WebSite"} <= types)
        self.assertNotIn("AggregateRating", html)  # never fabricate ratings

    def test_private_pages_are_noindex(self):
        for path in ["/account/login", "/account/register"]:
            self.assertIn('content="noindex,nofollow"', self.client.get(path).content.decode())

    def test_text_endpoints(self):
        robots = self.client.get("/robots.txt").content.decode()
        self.assertIn(f"Sitemap: {settings.SITE_URL}/sitemap.xml", robots)
        self.assertNotIn(settings.DJANGO_ADMIN_PATH, robots)  # don't advertise the admin path

        llms = self.client.get("/llms.txt").content.decode()
        self.assertTrue(llms.startswith("# FileSaviour"))
        for t in registry.TOOLS:
            self.assertIn(f"{settings.SITE_URL}{t.path}", llms)

        full = self.client.get("/llms-full.txt").content.decode()
        self.assertIn("## Frequently asked questions", full)

        self.assertEqual(self.client.get("/rss.xml").status_code, 200)
        self.assertEqual(self.client.get("/manifest.webmanifest")["Content-Type"], "application/manifest+json")

    def test_sitemaps_use_canonical_host_and_skip_unreleased_tools(self):
        index = self.client.get("/sitemap.xml").content.decode()
        self.assertIn(f"{settings.SITE_URL}/sitemap-tools.xml", index)
        self.assertNotIn("testserver", index)
        tools = self.client.get("/sitemap-tools.xml").content.decode()
        self.assertNotIn("testserver", tools)
        for t in registry.TOOLS:
            (self.assertIn if t.status != "soon" else self.assertNotIn)(f"{settings.SITE_URL}{t.path}<", tools)

    def test_og_image(self):
        r = self.client.get("/og/merge-pdf.png")
        self.assertEqual(r["Content-Type"], "image/png")
        self.assertEqual(self.client.get("/og/not-a-tool.png").status_code, 404)


class RegistryTests(TestCase):
    def test_slugs_do_not_shadow_site_routes(self):
        reserved = {"tools", "about", "faq", "contact", "terms", "privacy", "cookies", "blog", "dashboard",
                    "console", "account", "api", "static", "og", *(p.strip("/") for p in registry.CATEGORY_PATHS.values())}
        self.assertFalse(reserved & set(registry.by_slug()))

    def test_categories_add_up(self):
        self.assertEqual(sum(c["count"] for c in registry.category_payload()), len(registry.TOOLS))


@override_settings(DJANGO_VITE=VITE_DEV, ALLOWED_HOSTS=["testserver"], CELERY_TASK_ALWAYS_EAGER=True)
class JobApiTests(TestCase):
    def test_browser_tools_are_rejected_by_upload_api(self):
        r = self.client.post("/api/jobs", {"tool": "merge-pdf"})
        self.assertEqual(r.status_code, 400)

    def test_jobs_are_private_to_their_session(self):
        from apps.jobs.models import Job

        self.client.post("/api/jobs/log", json.dumps({"tool": "word-counter"}), content_type="application/json")
        job = Job.objects.get()
        self.assertEqual(self.client.get(f"/api/jobs/{job.id}").status_code, 200)
        self.client.logout()
        other = self.client_class()
        self.assertEqual(other.get(f"/api/jobs/{job.id}").status_code, 404)
