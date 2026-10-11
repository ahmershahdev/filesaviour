import socket

from .base import *

DEBUG = True
CELERY_TASK_ALWAYS_EAGER = True
STORAGES["staticfiles"] = {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}


def _vite_running(port: int = 5173) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.2):
            return True
    except OSError:
        return False


# Use Vite (HMR) when its dev server is up; otherwise fall back to the built
# bundle in frontend/dist so the site never renders as a blank page.
# VITE_DEV_MODE=true/false in the environment overrides the detection.
if "VITE_DEV_MODE" not in env.ENVIRON:
    DJANGO_VITE["default"]["dev_mode"] = _vite_running() or not (VITE_OUT_DIR / "manifest.json").exists()
