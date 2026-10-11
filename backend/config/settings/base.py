"""
Base settings shared by every environment.

Environment-specific values come from env vars (see /.env.example). Nothing
secret is committed here.
"""

from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
REPO_DIR = BASE_DIR.parent

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ["localhost", "127.0.0.1"]),
    CSRF_TRUSTED_ORIGINS=(list, []),
)
environ.Env.read_env(REPO_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="dev-only-insecure-key-change-me")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env("ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = env("CSRF_TRUSTED_ORIGINS")

# Canonical public origin. Used for sitemap, canonical tags, JSON-LD, llms.txt.
SITE_URL = env("SITE_URL", default="https://filesaviour.ahmershah.dev").rstrip("/")
SITE_NAME = "FileSaviour"
SITE_TAGLINE = "Save time. Save files. Save your sanity."
SITE_DESCRIPTION = (
    "FileSaviour is a free online toolkit of 42 PDF, image, AI writing and text "
    "tools. Merge, split, compress and convert files right in your browser."
)
SITE_AUTHOR = "Syed Ahmer Shah"
SITE_AUTHOR_URL = "https://ahmershah.dev"
SUPPORT_EMAIL = env("SUPPORT_EMAIL", default="support@ahmershah.dev")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",
    "django_vite",
    "inertia",
    "apps.core",
    "apps.accounts",
    "apps.tools",
    "apps.jobs",
    "apps.blog",
    "apps.console",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "inertia.middleware.InertiaMiddleware",
    "apps.core.middleware.inertia_share",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "apps.core.context_processors.site",
            ],
        },
    },
]

DATABASES = {"default": env.db("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
LOGIN_URL = "accounts:login"
LOGIN_REDIRECT_URL = "accounts:dashboard"

LANGUAGE_CODE = "en"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --- Static & Vite ---------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
VITE_OUT_DIR = REPO_DIR / "frontend" / "dist"
STATICFILES_DIRS = [BASE_DIR / "static", VITE_OUT_DIR]
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DJANGO_VITE = {
    "default": {
        "dev_mode": env.bool("VITE_DEV_MODE", default=DEBUG),
        "dev_server_port": 5173,
        "manifest_path": VITE_OUT_DIR / "manifest.json",
    }
}

# --- Inertia ----------------------------------------------------------------
INERTIA_LAYOUT = "base.html"
INERTIA_VERSION = env("INERTIA_VERSION", default="1")
INERTIA_SSR_ENABLED = env.bool("INERTIA_SSR_ENABLED", default=False)
INERTIA_SSR_URL = env("INERTIA_SSR_URL", default="http://127.0.0.1:13714")

# --- File processing ---------------------------------------------------------
# Uploaded files never touch STATIC/MEDIA; they live in a private scratch dir,
# are processed, and are deleted by the purge task after FILE_TTL_MINUTES.
MEDIA_ROOT = env("MEDIA_ROOT", default=str(BASE_DIR / "var" / "uploads"))
FILE_TTL_MINUTES = env.int("FILE_TTL_MINUTES", default=60)
MAX_UPLOAD_MB_ANON = env.int("MAX_UPLOAD_MB_ANON", default=50)
MAX_UPLOAD_MB_USER = env.int("MAX_UPLOAD_MB_USER", default=200)
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
ENGINE_URL = env("ENGINE_URL", default="http://127.0.0.1:8100")
ENGINE_TOKEN = env("ENGINE_TOKEN", default="dev-engine-token")
# AI calls happen in the engine (ANTHROPIC_API_KEY / AI_MODEL live in its env), never in Django.

# --- Celery -----------------------------------------------------------------
REDIS_URL = env("REDIS_URL", default="redis://127.0.0.1:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_TASK_ALWAYS_EAGER = env.bool("CELERY_TASK_ALWAYS_EAGER", default=False)
CELERY_TASK_TIME_LIMIT = 300
CELERY_BEAT_SCHEDULE = {
    "purge-expired-files": {"task": "apps.jobs.tasks.purge_expired", "schedule": 300.0},
}

# --- Security headers (tightened further in prod.py) -------------------------
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_HTTPONLY = True

# Obscured path for the raw Django admin; staff normally use /console/.
DJANGO_ADMIN_PATH = env("DJANGO_ADMIN_PATH", default="vault-admin/")
