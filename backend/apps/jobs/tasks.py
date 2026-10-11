import logging

from celery import shared_task
from django.utils import timezone

from . import engine
from .models import Job

log = logging.getLogger(__name__)


@shared_task(acks_late=True, max_retries=0)
def run_job(job_id: str):
    job = Job.objects.get(pk=job_id)
    job.status = Job.Status.RUNNING
    job.save(update_fields=["status"])

    inputs = sorted((job.workdir / "in").iterdir())
    out_dir = job.workdir / "out"
    out_dir.mkdir(parents=True, exist_ok=True)
    try:
        result = engine.process(job.tool, inputs, job.options, out_dir)
    except engine.EngineError as exc:
        job.status, job.error = Job.Status.FAILED, str(exc)[:500]
    except Exception:
        log.exception("job %s crashed", job_id)
        job.status, job.error = Job.Status.FAILED, "Something went wrong while processing this file."
    else:
        job.status = Job.Status.DONE
        job.output_name = result.name
        job.output_bytes = result.stat().st_size
        job.bytes_saved = max(job.input_bytes - job.output_bytes, 0)
    job.finished_at = timezone.now()
    job.save()


@shared_task
def purge_expired():
    """Delete files whose TTL passed. Rows are kept (without files) for stats."""
    expired = Job.objects.filter(expires_at__lte=timezone.now()).exclude(status=Job.Status.EXPIRED)
    count = 0
    for job in expired.iterator():
        job.purge_files()
        job.status = Job.Status.EXPIRED
        job.save(update_fields=["status"])
        count += 1
    return count
