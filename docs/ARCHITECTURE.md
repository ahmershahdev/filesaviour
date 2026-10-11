# FileSaviour — Architecture

Domain: **https://filesaviour.ahmershah.dev** · 42 tools · Django + Inertia + React + Flask engine

## 1. Stack decisions

| Layer | Choice | Why |
|---|---|---|
| Web app | **Django 6.1** | Auth, ORM, admin, migrations, sitemaps and syndication are built in. One framework owns users, jobs, content and SEO. |
| SPA bridge | **Inertia.js v3** (`inertia-django`) | React pages with Django routing and controllers. No separate REST API to version, no client-side router. |
| UI | **React 19 + TypeScript + Tailwind CSS v4** (Vite 8) | Component model for 42 workspaces; Tailwind v4 CSS-first tokens (`@theme`) keep the design system in one file. |
| 3D | **three.js + React Three Fiber** | Home hero only, lazy-loaded after first paint. |
| Motion | **Motion** + **Lenis** | Page transitions, reveals and inertial scroll. All respect `prefers-reduced-motion`. |
| Processing | **Flask engine** (separate container) | Untrusted-file parsing (LibreOffice, Ghostscript, qpdf, Tesseract, rembg) is isolated from the app, the DB and the secrets. Flask fits a small stateless service. |
| Queue | **Celery + Redis** | Server jobs run off the request path; beat runs the TTL purge. |
| DB | **PostgreSQL 17** (SQLite in dev) | Users, jobs (metadata only), blog posts. |
| AI | **Claude API** (`claude-opus-5-5`) from the engine only | Django never sees the API key. |
| Edge | **Caddy** | Automatic TLS, HSTS, CSP, compression, immutable asset caching. |

> **Why both Django and Flask?** They have different jobs. Django is the product (pages, users, SEO, admin). Flask is a sandboxed worker with no database or user data, and it holds the only outbound credential (the AI key). If a malicious PDF exploits a converter, it lands in a read-only, capability-dropped container that can't reach Postgres.

## 2. Topology

```
                ┌─────────── Caddy (TLS, CSP, HSTS, caching) ───────────┐
browser ──────► │                                                        │
                └───────────────┬────────────────────────────────────────┘
                                ▼
                    web: Django + Inertia ──► ssr: Node (Inertia SSR :13714)
                     │        │
            Postgres ◄┘        └► Redis ◄── worker: Celery ──► engine: Flask (:8100)
                                          beat: TTL purge         │  read-only FS, tmpfs, no caps
                                                                  └► Claude API (only egress)
```

Networks: `app` (caddy, web, ssr, postgres, redis) and `processing` (web, worker, engine). The engine is not on `app`, so it cannot reach Postgres, Redis or the SSR server.

## 3. Where each tool runs

Every tool declares a `runtime` in `backend/apps/tools/registry.py`:

| Runtime | Count | Path | Privacy |
|---|---|---|---|
| `browser` | 17 | React workspace (pdf-lib, Canvas, WASM). Sends an anonymous size-only usage ping to `/api/jobs/log`. | File never leaves the device |
| `server` | 15 | Upload → `/api/jobs` → Celery → engine → download | Encrypted at rest, deleted ≤ 1 h |
| `ai` | 10 | Same path; the engine calls Claude | Not used for training, deleted ≤ 1 h |

### Job lifecycle (server/AI)

1. `POST /api/jobs` (multipart: `tool`, `options`, `files[]`). Validates the tool, size limit (50 MB guest / 200 MB user), extension allowlist and file count. Files are written as `000.pdf` etc.; client filenames never touch disk.
2. `Job` row created (owner = user, or session key for guests) and `run_job.delay()`.
3. Celery posts the files to the engine with a bearer token. The engine writes them into a per-job temp dir, runs the processor, and streams the result back. Its temp dir is removed on response close, with a 10-minute sweeper as a safety net.
4. Client polls `GET /api/jobs/<id>`, then downloads `GET /api/jobs/<id>/file`.
5. `DELETE /api/jobs/<id>` purges immediately. Otherwise `purge_expired` (beat, every 5 min) deletes files at `expires_at` and keeps the row (without file data) for stats.

Ownership is enforced on every job endpoint: another session gets a 404, never a 403, so job IDs aren't enumerable.

## 4. Repository layout

```
backend/                 Django project
  config/settings/       base.py · dev.py · prod.py (env-driven, no secrets in git)
  apps/core/             pages, SEO (seo.py), sitemaps, robots/llms/manifest, OG images, content.py (FAQ + legal)
  apps/tools/            registry.py (THE source of truth for 42 tools), tool/category views
  apps/jobs/             Job model, upload API, Celery tasks, engine client
  apps/accounts/         email-login User, auth, dashboard, settings, account deletion
  apps/blog/             Post model, index/detail, RSS feed
  apps/console/          staff console (/console): KPIs, tool health, failures, users
  templates/base.html    Inertia root + server-rendered <head>
frontend/                Vite + React + TS + Tailwind v4
  src/styles/app.css     design tokens (see DESIGN.md)
  src/pages/             one file per Inertia page (code-split)
  src/layouts/           SiteLayout (public), AppLayout (dashboard/console)
  src/components/        site/ (header, footer, ⌘K, SEO), tool/ (dropzone, cards, workspaces/), webgl/, ui/
  src/ssr.tsx            Inertia SSR server
engine/                  Flask processing service + processors/
deploy/Caddyfile         edge config
docker-compose.yml       production topology
design/brand/            logo system source (SVG builder, wordmark outlines) → backend/static/brand
```

## 5. Pages & routes

| Route | Page | Index |
|---|---|---|
| `/` | Home (WebGL hero, drop-anything router, category rooms) | ✓ |
| `/tools` | All tools (search + category filter) | ✓ |
| `/pdf-tools` `/image-tools` `/ai-writing-tools` `/utility-tools` | Category hubs | ✓ |
| `/<tool-slug>` | Tool page (workspace, how-to, FAQ, related) ×42 | ✓ (except `soon`) |
| `/about` `/faq` `/contact` `/blog` `/blog/<slug>` | Content | ✓ |
| `/terms` `/privacy` `/cookies` | Legal (shared renderer, content in `content.py`) | ✓ |
| `/account/login` `/account/register` | Auth | noindex |
| `/dashboard` `/dashboard/settings` | User area | noindex, login required |
| `/console` `/console/users` | Staff console | noindex, staff only |
| `/$DJANGO_ADMIN_PATH` | Django admin (data editing) | not linked, not in robots.txt |
| `/api/jobs…` | Job API | disallowed |

Tool pages sit at the root (`/merge-pdf`) to match search intent, the same pattern market leaders use. A test (`RegistryTests`) prevents a slug from shadowing a site route.

## 6. Security checklist

- [x] Untrusted parsing isolated in the engine (read-only root, tmpfs, `cap_drop: ALL`, memory/CPU/PID limits, non-root)
- [x] Engine auth: constant-time bearer token; private network only
- [x] Client filenames never used on disk; result filename sanitised to basename
- [x] Extension allowlist per tool; size limits enforced by Django and Caddy
- [x] Job ownership checks; 404 on foreign jobs
- [x] CSRF on all mutating endpoints; `SESSION_COOKIE_HTTPONLY`, secure cookies and HSTS in prod
- [x] CSP, `X-Frame-Options: DENY`, `nosniff`, a strict `Referrer-Policy` and `Permissions-Policy`
- [x] Open-redirect-safe `?next=` on login
- [x] Admin path configurable and not advertised
- [x] `html-to-pdf` deliberately **not** enabled until it gets a no-network browser sandbox (SSRF / `file://` risk)
- [ ] **Rate limiting** on `/api/jobs` and auth (Caddy `rate_limit` or `django-ratelimit`). Required before launch.
- [ ] Malware scan (ClamAV sidecar) for files that are later downloadable by the same user
- [ ] Timeout on the SSR call: inertia-django's SSR request has no timeout, so wrap it or keep the SSR sidecar health-checked

## 7. Implementation status (42 tools)

| State | Tools |
|---|---|
| **Working: browser** (6) | merge-pdf, compress-image, resize-image, convert-image, word-counter, text-analyzer |
| **Working: engine** (15) | compress-pdf, protect-pdf\*, ocr-pdf, word-to-pdf, pdf-to-word, file-converter\*, compress-gif, remove-background, file-optimizer, ai-summarizer, paraphrasing-tool, grammar-checker, ai-humanizer, content-improver, translate-pdf\* |
| **Page live, browser engine pending** (11) | split-pdf, extract-pdf-pages, image-to-pdf, edit-pdf, sign-pdf, crop-pdf, add-page-numbers, crop-image, bulk-crop-images, bulk-convert-images, bulk-compress-images |
| **Page live, server engine pending** (8) | pdf-to-powerpoint, pdf-to-excel, html-to-pdf, compare-pdf, enhance-image, remove-watermark, ai-image-detector, ai-content-detector |
| **Coming soon, not in sitemap** (2) | plagiarism-checker, plagiarism-remover (needs a licensed search/originality API) |

\* Needs a per-tool options panel. The generic `ServerWorkspace` currently sends `{}`, so protect-pdf asks for a password and fails, file-converter defaults to PDF, and translate defaults to English. Next step: an `options` schema per tool in the registry, rendered by the workspace.

Pending tools render an honest "being built" state, never a fake result.

## 8. Local development

See the README. In short: `backend/` venv + `runserver`, `frontend/` `npm run dev`, optional `engine/` venv with `ENGINE_TOKEN`. Celery runs eagerly in dev (no Redis needed).
