"""
Open Graph images (1200x630) rendered with Pillow.

/og/<tool-slug>.png is generated on first request and cached on disk, so
social shares of every tool get a branded card without a design pass per
tool. `manage.py build_brand_assets` pre-renders all of them plus the
default card.
"""

from contextlib import suppress
from functools import cache
from io import BytesIO
from pathlib import Path

from django.conf import settings
from django.http import Http404, HttpResponse
from django.views.decorators.cache import cache_control
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from apps.tools import registry

BRAND = settings.BASE_DIR / "static" / "brand"
FONT = BRAND / "fonts" / "BricolageGrotesque.ttf"
CACHE_DIR = settings.BASE_DIR / "var" / "og"

INK = (5, 7, 13)
FG = (244, 246, 251)
MUTED = (154, 163, 184)
ACCENTS = {"pdf": (45, 107, 255), "image": (79, 195, 255), "ai": (255, 194, 26), "utility": (61, 220, 151)}
W, H = 1200, 630


@cache
def _font(size: int, weight: int = 700) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(str(FONT), size)
    with suppress(OSError, ValueError):  # non-variable fallback font: keep default instance
        font.set_variation_by_axes([min(max(size, 12), 96), min(max(weight, 200), 800), 100])  # opsz, wght, wdth
    return font


def _glow(img: Image.Image, color, center, radius):
    layer = Image.new("RGB", img.size, INK)
    ImageDraw.Draw(layer).ellipse(
        [center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius], fill=color
    )
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.55))
    return Image.blend(img, layer, 0.35)


def _orbit(draw: ImageDraw.ImageDraw, cx, cy, rx, ry, color):
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=color, width=2)


def _wrap(text: str, font, max_w: int) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if font.getlength(trial) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    return [*lines, cur] if cur else lines


def render_card(title: str, subtitle: str, eyebrow: str, accent=(255, 194, 26)) -> bytes:
    img = Image.new("RGB", (W, H), INK)
    img = _glow(img, accent, (980, 140), 320)
    draw = ImageDraw.Draw(img)
    _orbit(draw, 960, 300, 330, 90, tuple(int(c * 0.55) for c in accent))

    mark = Image.open(BRAND / "logo.png").convert("RGBA")
    mark.thumbnail((84, 84))
    img.paste(mark, (66, 60), mark)
    draw.text((170, 88), "FileSaviour", font=_font(40, 650), fill=FG)

    draw.text((72, 236), eyebrow.upper(), font=_font(24, 500), fill=accent)
    title_font = _font(104 if len(title) < 16 else 84, 750)
    y = 278
    for line in _wrap(title, title_font, W - 144)[:2]:
        draw.text((68, y), line, font=title_font, fill=FG)
        y += int(title_font.size * 1.0)
    sub_font = _font(30, 420)
    y += 18
    for line in _wrap(subtitle, sub_font, W - 160)[:2]:
        draw.text((72, y), line, font=sub_font, fill=MUTED)
        y += 42
    draw.text((72, H - 64), "filesaviour.ahmershah.dev", font=_font(24, 500), fill=MUTED)

    buf = BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def tool_card_bytes(slug: str) -> bytes:
    tool = registry.get(slug)
    if tool is None:
        raise KeyError(slug)
    path = CACHE_DIR / f"{slug}-{registry.CONTENT_UPDATED}.png"
    if path.exists():
        return path.read_bytes()
    cat = registry.categories()[tool.category]
    short = tool.summary.split(". ")[0].rstrip(".") + "."
    data = render_card(tool.name, short, f"Free {cat.name.lower()} · {RUNTIME_LABEL[tool.runtime]}", ACCENTS[tool.category])
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return data


RUNTIME_LABEL = {"browser": "runs in your browser", "server": "secure processing", "ai": "AI powered"}


@cache_control(public=True, max_age=60 * 60 * 24 * 7)
def tool_og(request, slug: str):
    try:
        return HttpResponse(tool_card_bytes(slug), content_type="image/png")
    except KeyError:
        raise Http404 from None


def build_static_assets(out: Path = BRAND) -> list[Path]:
    """Default OG card. Logo, favicon and app icons are vector-built by design/brand/build.mjs."""
    p = out / "og-default.png"
    p.write_bytes(render_card("Every file, saved.", "42 free PDF, image, AI and text tools. Most run right in your browser.", "Free online file toolkit"))
    return [p]
