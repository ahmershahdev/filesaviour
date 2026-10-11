import json

from django import template
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.html import format_html
from django.utils.safestring import mark_safe

register = template.Library()

# Same escaping as Django's json_script: safe inside <script>.
_ESCAPES = {ord(">"): "\u003E", ord("<"): "\u003C", ord("&"): "\u0026"}


@register.filter
def jsonld(value, index=0):
    """<script type=application/ld+json>, keyed so Inertia's <Head> can replace it on navigation."""
    data = json.dumps(value, cls=DjangoJSONEncoder, ensure_ascii=False, separators=(",", ":")).translate(_ESCAPES)
    return format_html('<script type="application/ld+json" data-inertia="jsonld-{}">{}</script>', index, mark_safe(data))
