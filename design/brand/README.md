# Brand assets

Concept: a **shield** (protection) holding a **secured folder** (keyhole) with a **file** inside, circled by
the **orbit** ring from the original logo. Built on a 64-unit grid. Colours: vault blue `#2D6BFF`
(gradient `#4C86FF` to `#1641C8`), signal yellow `#FFC21A`, sky `#4FC3FF`, ink `#05070D`.

Rebuild (needs Node and `npm i @resvg/resvg-js@2.6.2`; the wordmark step needs `pip install fonttools`):

```bash
python outline.py ../../backend/static/brand/fonts/BricolageGrotesque.ttf > wordmark.json
node build.mjs ../../backend/static/brand
```

Then pack `favicon.ico` from the intermediate PNGs:

```bash
python -c "from PIL import Image; i=[Image.open(f'.ico-src/favicon-{s}.png') for s in (16,32,48)]; Image.open('.ico-src/favicon-256.png').save('../../backend/static/brand/favicon.ico', sizes=[(16,16),(32,32),(48,48)], append_images=i)"
```

Usage: keep clear space of at least the shield's width ÷ 4 on every side. Use `logo-horizontal-dark.svg`
on dark backgrounds and `logo-horizontal-light.svg` on light ones. Don't recolour, stretch or add effects.
Below 24 px, use `favicon.svg` (no orbit, no lines).
