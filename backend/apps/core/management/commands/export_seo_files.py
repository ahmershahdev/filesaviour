from pathlib import Path

from django.core.management.base import BaseCommand
from django.test import Client
from django.test.utils import override_settings

FILES = ["robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt",
         "rss.xml", "manifest.webmanifest", ".well-known/security.txt"]


class Command(BaseCommand):
    help = "Write the generated SEO files (robots, sitemaps, llms, rss…) to a folder as static snapshots."

    def add_arguments(self, parser):
        parser.add_argument("--out", default="../docs/seo", help="Output directory (default: docs/seo)")

    def handle(self, *args, out, **opts):
        out_dir = Path(out).resolve()
        with override_settings(ALLOWED_HOSTS=["*"]):
            client = Client(HTTP_HOST="localhost")
            for name in FILES:
                resp = client.get(f"/{name}")
                if resp.status_code != 200:
                    self.stderr.write(f"skip {name}: HTTP {resp.status_code}")
                    continue
                path = out_dir / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(resp.content)
                self.stdout.write(f"wrote {path.relative_to(out_dir.parent)}")
