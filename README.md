# FileSaviour

**Save time. Save files. Save your sanity.** 42 free PDF, image, AI-writing and utility tools at
[filesaviour.ahmershah.dev](https://filesaviour.ahmershah.dev).

Django 6 · Inertia.js v3 · React 19 · TypeScript · Tailwind CSS v4 · three.js / R3F · Celery · PostgreSQL · Flask processing engine

- [Architecture](docs/ARCHITECTURE.md): stack, topology, job lifecycle, security, implementation status
- [Design system](docs/DESIGN.md): "Vault" tokens, type, motion, WebGL hero, performance budget
- [SEO](docs/SEO.md): structured data, sitemap, robots, llms.txt, RSS, launch checklist

## How to run it locally

Requirements: **Python 3.13+** and **Node 22+**. Commands below work in Git Bash or PowerShell on Windows
(on macOS/Linux use `.venv/bin/` instead of `.venv/Scripts/`).

**First time only:**

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements/dev.txt
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py createsuperuser        # your admin login for /console
.venv/Scripts/python manage.py build_brand_assets     # OG preview images

cd ../frontend
npm install
```

**Every time: two terminals.**

```bash
# Terminal 1: Django (the site)
cd backend
.venv/Scripts/python manage.py runserver

# Terminal 2: Vite (hot-reloading CSS/React)
cd frontend
npm run dev
```

Then open **http://127.0.0.1:8000**. Always use Django's port; Vite on :5173 only serves assets.

| URL | What |
|---|---|
| `/` · `/tools` · `/merge-pdf` | Public site |
| `/dashboard` | User area (after sign-up) |
| `/console` | Staff console (log in as the superuser) |
| `/vault-admin/` | Django data admin (path set by `DJANGO_ADMIN_PATH`) |
| `/sitemap.xml` · `/robots.txt` · `/llms.txt` · `/rss.xml` | SEO files |

**Optional: server and AI tools.** Browser tools (merge PDF, image compress/resize/convert, word counter,
text analyzer) work with just the two terminals. For server/AI tools, start the engine in a third terminal:

```bash
cd engine
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
ENGINE_TOKEN=dev-engine-token ANTHROPIC_API_KEY=your-key .venv/Scripts/python app.py    # :8100
```

In dev, Celery runs jobs inline (no Redis needed). Converter programs (LibreOffice, Ghostscript, qpdf,
Tesseract, gifsicle) are only needed for the tools that use them; the Docker image includes all of them.

**Production build locally:** `npm run build` in `frontend/`, then start Django with `VITE_DEV_MODE=false`
(restart Django after every build).

## Brand

The logo system lives in `design/brand/`. `build.mjs` generates every asset in `backend/static/brand/`
from one SVG geometry: mark, favicon (simplified for 16px), horizontal lockups for dark and light
backgrounds, app icons, apple-touch-icon and `favicon.ico`. The wordmark is Bricolage Grotesque converted
to outlines, so it doesn't depend on the font being installed.

## Tests & lint

```bash
cd backend && .venv/Scripts/python manage.py test apps   # SEO contract, registry, job privacy
.venv/Scripts/ruff check ../backend ../engine/app.py ../engine/processors
cd ../frontend && npm run typecheck
```

## Production

```bash
cp .env.example .env && cp engine/.env.example .env.engine   # fill in secrets
docker compose up -d --build
docker compose exec web python manage.py createsuperuser
```

Caddy terminates TLS for `filesaviour.ahmershah.dev` (point the DNS A/AAAA records at the host first).

## Adding a tool

1. Add a `Tool(...)` entry in `backend/apps/tools/registry.py` (slug, copy, accepted formats, runtime).
2. **Browser tool:** add a workspace in `frontend/src/components/tool/workspaces/` and map the slug in `workspaces/index.ts`.
   **Server/AI tool:** add a processor in `engine/processors/` with `@processor("<slug>")`.
3. Bump `CONTENT_UPDATED`. The page, sitemap, JSON-LD, OG image, llms.txt and nav update automatically.
