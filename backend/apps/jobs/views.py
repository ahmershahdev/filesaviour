"""
JSON API used by tool workspaces. Thin: parse HTTP, call services/selectors.

POST   /api/jobs              multipart: tool, options (JSON), files[]  -> {id}
GET    /api/jobs/<id>         -> status row
GET    /api/jobs/<id>/file    -> result download
DELETE /api/jobs/<id>         -> delete now
POST   /api/jobs/log          browser-tool usage ping (sizes only, no file data)
"""

import json

from django.http import FileResponse, Http404, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from . import selectors, services
from .models import Job


def _owner(request) -> services.Owner:
    if request.user.is_authenticated:
        return services.Owner(user=request.user)
    if not request.session.session_key:
        request.session.save()
    return services.Owner(user=None, session_key=request.session.session_key)


def _job(request, job_id) -> Job:
    owner = _owner(request)
    job = selectors.job_for_owner(job_id=job_id, user=owner.user, session_key=owner.session_key)
    if job is None:
        raise Http404  # 404, not 403: job IDs must not be enumerable
    return job


def _error(exc: services.JobError) -> JsonResponse:
    return JsonResponse({"error": str(exc)}, status=exc.status)


@require_POST
def create(request):
    try:
        options = json.loads(request.POST.get("options") or "{}")
        if not isinstance(options, dict):
            raise ValueError
    except ValueError:
        return _error(services.JobError("Invalid options."))
    try:
        tool = services.server_tool_or_error(request.POST.get("tool", ""))
        job = services.job_create(tool=tool, files=request.FILES.getlist("files"), options=options, owner=_owner(request))
    except services.JobError as exc:
        return _error(exc)
    return JsonResponse({"id": str(job.id)}, status=202)


@require_http_methods(["GET", "DELETE"])
def detail(request, job_id):
    job = _job(request, job_id)
    if request.method == "DELETE":
        services.job_delete_now(job)
        return JsonResponse({"ok": True})
    return JsonResponse({**job.as_row(), "error": job.error})


def download(request, job_id):
    job = _job(request, job_id)
    path = job.workdir / "out" / job.output_name
    if job.status != Job.Status.DONE or job.expires_at <= timezone.now() or not path.is_file():
        raise Http404
    return FileResponse(path.open("rb"), as_attachment=True, filename=job.output_name)


@require_POST
def log_browser_run(request):
    try:
        data = json.loads(request.body or "{}")
        if not isinstance(data, dict):
            raise ValueError
        services.browser_run_log(slug=data.get("tool", ""), input_bytes=data.get("inputBytes"),
                                 output_bytes=data.get("outputBytes"), owner=_owner(request))
    except ValueError:
        return _error(services.JobError("Invalid JSON."))
    except services.JobError as exc:
        return _error(exc)
    return JsonResponse({"ok": True}, status=201)
