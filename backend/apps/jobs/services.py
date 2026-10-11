"""
Job write operations. Views validate HTTP input and call these; tasks and the
console reuse them. Business rules live here, not in views or model.save().
"""

from dataclasses import dataclass
from pathlib import Path

from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.utils import timezone

from apps.tools import registry
from apps.tools.registry import Tool

from .models import Job

MAX_FILES = 20


class JobError(Exception):
    """A user-facing validation error; `status` is the HTTP code to answer with."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


@dataclass(frozen=True)
class Owner:
    user: object | None
    session_key: str = ""


def server_tool_or_error(slug: str) -> Tool:
    tool = registry.get(slug)
    if tool is None or tool.runtime == "browser" or tool.status == "soon":
        raise JobError("Unknown or unavailable tool.")
    return tool


def validate_uploads(tool: Tool, files: list[UploadedFile], *, authenticated: bool) -> int:
    if not files:
        raise JobError("Please add a file.")
    if len(files) > MAX_FILES:
        raise JobError(f"Up to {MAX_FILES} files at a time.")
    limit_mb = settings.MAX_UPLOAD_MB_USER if authenticated else settings.MAX_UPLOAD_MB_ANON
    total = sum(f.size for f in files)
    if total > limit_mb * 1024 * 1024:
        raise JobError(f"Files are larger than the {limit_mb} MB limit.", 413)
    allowed = {a for a in tool.accepts if a.startswith(".")}
    for f in files:
        if allowed and Path(f.name).suffix.lower() not in allowed:
            raise JobError(f"{f.name}: this tool accepts {', '.join(sorted(allowed))}.", 415)
    return total


def job_create(*, tool: Tool, files: list[UploadedFile], options: dict, owner: Owner) -> Job:
    """Persist uploads under the job's private workdir and queue processing."""
    from .tasks import run_job  # avoid import cycle at module load

    total = validate_uploads(tool, files, authenticated=owner.user is not None)
    job = Job.objects.create(
        tool=tool.slug, runtime=tool.runtime, options=options, input_name=files[0].name[:255],
        input_bytes=total, user=owner.user, session_key=owner.session_key,
    )
    in_dir = job.workdir / "in"
    in_dir.mkdir(parents=True, exist_ok=True)
    for i, f in enumerate(files):
        # Never trust the client filename on disk: index + sanitised suffix only.
        with (in_dir / f"{i:03d}{Path(f.name).suffix.lower()[:10]}").open("wb") as fh:
            for chunk in f.chunks():
                fh.write(chunk)
    run_job.delay(str(job.id))
    return job


def job_delete_now(job: Job) -> None:
    job.purge_files()
    job.status, job.expires_at = Job.Status.EXPIRED, timezone.now()
    job.save(update_fields=["status", "expires_at"])


def browser_run_log(*, slug: str, input_bytes, output_bytes, owner: Owner) -> Job:
    """Size-only usage record for tools that ran entirely in the browser."""
    tool = registry.get(slug)
    if tool is None or tool.runtime != "browser":
        raise JobError("Unknown tool.")
    size_in, size_out = _non_negative_int(input_bytes), _non_negative_int(output_bytes)
    now = timezone.now()
    return Job.objects.create(
        tool=tool.slug, runtime="browser", status=Job.Status.DONE, finished_at=now, expires_at=now,
        input_bytes=size_in, output_bytes=size_out, bytes_saved=max(size_in - size_out, 0),
        user=owner.user, session_key=owner.session_key,
    )


def purge_expired() -> int:
    """Delete files past their TTL; rows stay (without files) for statistics."""
    count = 0
    for job in Job.objects.filter(expires_at__lte=timezone.now()).exclude(status=Job.Status.EXPIRED).iterator():
        job.purge_files()
        job.status = Job.Status.EXPIRED
        job.save(update_fields=["status"])
        count += 1
    return count


def _non_negative_int(value) -> int:
    try:
        return max(int(value or 0), 0)
    except (TypeError, ValueError):
        return 0
