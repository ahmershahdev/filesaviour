from .base import *

DEBUG = True
CELERY_TASK_ALWAYS_EAGER = True
STORAGES["staticfiles"] = {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}
