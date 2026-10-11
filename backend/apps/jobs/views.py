"""
JSON API used by tool workspaces.

POST   /api/jobs              multipart: tool, options (JSON), files[]  -> {id}
GET    /api/jobs/<id>         -> status row
GET    /api/jobs/<id>/file    -> result download
DELETE /api/jobs/<id>         -> delete now
POST   /api/jobs/log          browser-tool usage ping (no file data)
"""

import json
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from apps.tools import registry

from .models import Job
from .tasks import run_job

MAX_FILES = 20


def _owner_filter(request) -> dict:
    if request.user.is_authenticated:
        return {"user": request.user}
    if not request.session.session_key:
        request.session.save()
    return {"session_key": request.session.session_key, "user": None}


def _get_job(request, job_id) -> Job:
    try:
        return Job.objects.get(pk=job_id, **_owner_filter(request))
    except (Job.DoesNotExist, ValueError):
        raise Http404 from None


def _bad(message: str, status: int = 400):
    return JsonResponse({"error": message}, status=status)


@require_POST
def create(request):
    tool = registry.get(request.POST.get("tool", ""))
    if tool is None or tool.runtime == "browser" or tool.status == "soon":
        return _bad("Unknown or unavailable tool.")
    files = request.FILES.getlist("files")
    if not files:
        return _bad("Please add a file.")
    if len(files) > MAX_FILES:
        return _bad(f"Up to {MAX_FILES} files at a time.")

    limit_mb = settings.MAX_UPLOAD_MB_USER if request.user.is_authenticated else settings.MAX_UPLOAD_MB_ANON
    total = sum(f.size for f in files)
    if total > limit_mb * 1024 * 1024:
        return _bad(f"Files are larger than the {limit_mb} MB limit.", 413)

    allowed = {a for a in tool.accepts if a.startswith(".")}
    for f in files:
        if allowed and Path(f.name).suffix.lower() not in allowed:
            return _bad(f"{f.name}: this tool accepts {', '.join(sorted(allowed))}.", 415)

    try:
        options = json.loads(request.POST.get("options") or "{}")
        assert isinstance(options, dict)
    except (ValueError, AssertionError):
        return _bad("Invalid options.")

    owner = _owner_filter(request)
    job = Job.objects.create(tool=tool.slug, runtime=tool.runtime, options=options,
                             input_name=files[0].name[:255], input_bytes=total,
                             user=owner["user"], session_key=owner.get("session_key", ""))
    in_dir = job.workdir / "in"
    in_dir.mkdir(parents=True, exist_ok=True)
    for i, f in enumerate(files):
        # Never trust the client filename on disk: index + sanitized suffix only.
        target = in_dir / f"{i:03d}{Path(f.name).suffix.lower()[:10]}"
        with target.open("wb") as fh:
            for chunk in f.chunks():
                fh.write(chunk)

    run_job.delay(str(job.id))
    return JsonResponse({"id": str(job.id)}, status=202)


@require_http_methods(["GET", "DELETE"])
def detail(request, job_id):
    job = _get_job(request, job_id)
    if request.method == "DELETE":
        job.purge_files()
        job.status, job.expires_at = Job.Status.EXPIRED, timezone.now()
        job.save(update_fields=["status", "expires_at"])
        return JsonResponse({"ok": True})
    return JsonResponse({**job.as_row(), "error": job.error})


def download(request, job_id):
    job = _get_job(request, job_id)
    path = job.workdir / "out" / job.output_name
    if job.status != Job.Status.DONE or job.expires_at <= timezone.now() or not path.is_file():
        raise Http404
    return FileResponse(path.open("rb"), as_attachment=True, filename=job.output_name)


@require_POST
def log_browser_run(request):
    """Browser tools report anonymous usage so stats and history stay complete."""
    try:
        data = json.loads(request.body or "{}")
    except ValueError:
        return _bad("Invalid JSON.")
    tool = registry.get(data.get("tool", ""))
    if tool is None or tool.runtime != "browser":
        return _bad("Unknown tool.")
    owner = _owner_filter(request)
    Job.objects.create(
        tool=tool.slug, runtime="browser", status=Job.Status.DONE, finished_at=timezone.now(),
        expires_at=timezone.now(), input_bytes=int(data.get("inputBytes") or 0),
        output_bytes=int(data.get("outputBytes") or 0),
        bytes_saved=max(int(data.get("inputBytes") or 0) - int(data.get("outputBytes") or 0), 0),
        user=owner["user"], session_key=owner.get("session_key", ""),
    )
    return JsonResponse({"ok": True}, status=201)
