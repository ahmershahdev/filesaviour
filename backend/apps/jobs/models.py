import shutil
import uuid
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils import timezone


def _expiry():
    return timezone.now() + timedelta(minutes=settings.FILE_TTL_MINUTES)


class Job(models.Model):
    """One run of a server or AI tool. Browser tools only log a lightweight Job (no files)."""

    class Status(models.TextChoices):
        QUEUED = "queued"
        RUNNING = "running"
        DONE = "done"
        FAILED = "failed"
        EXPIRED = "expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="jobs")
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    tool = models.SlugField(max_length=60, db_index=True)
    runtime = models.CharField(max_length=10, default="server")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.QUEUED, db_index=True)
    options = models.JSONField(default=dict, blank=True)

    input_name = models.CharField(max_length=255, blank=True)
    input_bytes = models.BigIntegerField(default=0)
    output_name = models.CharField(max_length=255, blank=True)
    output_bytes = models.BigIntegerField(default=0)
    bytes_saved = models.BigIntegerField(default=0)
    error = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(default=_expiry, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["tool", "status", "created_at"])]

    @property
    def workdir(self) -> Path:
        return Path(settings.MEDIA_ROOT) / str(self.id)

    @property
    def duration_ms(self) -> int | None:
        if self.finished_at:
            return int((self.finished_at - self.created_at).total_seconds() * 1000)
        return None

    def purge_files(self):
        shutil.rmtree(self.workdir, ignore_errors=True)

    def as_row(self) -> dict:
        return {
            "id": str(self.id),
            "tool": self.tool,
            "status": self.status,
            "inputName": self.input_name,
            "inputBytes": self.input_bytes,
            "outputName": self.output_name,
            "outputBytes": self.output_bytes,
            "createdAt": self.created_at.isoformat(),
            "expiresAt": self.expires_at.isoformat(),
            "downloadable": self.status == self.Status.DONE and self.expires_at > timezone.now(),
        }


@receiver(post_delete, sender=Job)
def _remove_job_files(sender, instance: Job, **kwargs):
    instance.purge_files()
