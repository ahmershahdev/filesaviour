from django.test import TestCase

from apps.tools import registry


class RegistryTests(TestCase):
    def test_slugs_do_not_shadow_site_routes(self):
        reserved = {"tools", "about", "faq", "contact", "terms", "privacy", "cookies", "blog", "dashboard",
                    "console", "account", "api", "static", "og", *(p.strip("/") for p in registry.CATEGORY_PATHS.values())}
        self.assertFalse(reserved & set(registry.by_slug()))

    def test_categories_add_up(self):
        self.assertEqual(sum(c["count"] for c in registry.category_payload()), len(registry.TOOLS))
