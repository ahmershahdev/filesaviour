from django.core.management.base import BaseCommand

from apps.core import og
from apps.tools import registry


class Command(BaseCommand):
    help = "Render the default OG card and every tool's OG card."

    def handle(self, *args, **opts):
        for p in og.build_static_assets():
            self.stdout.write(f"wrote {p.name}")
        for t in registry.TOOLS:
            og.tool_card_bytes(t.slug)
        self.stdout.write(self.style.SUCCESS(f"rendered {len(registry.TOOLS)} tool cards"))
