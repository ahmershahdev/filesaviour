from django.urls import path

from . import views

app_name = "jobs"
urlpatterns = [
    path("api/jobs", views.create, name="create"),
    path("api/jobs/log", views.log_browser_run, name="log"),
    path("api/jobs/<uuid:job_id>", views.detail, name="detail"),
    path("api/jobs/<uuid:job_id>/file", views.download, name="download"),
]
