"""Job read operations (dashboard, console, API)."""

from datetime import timedelta

from django.db.models import Avg, Count, F, Q, QuerySet, Sum
from django.utils import timezone

from .models import Job


def jobs_for_owner(*, user=None, session_key: str = "") -> QuerySet[Job]:
    if user is not None:
        return Job.objects.filter(user=user)
    return Job.objects.filter(user=None, session_key=session_key)


def job_for_owner(*, job_id, user=None, session_key: str = "") -> Job | None:
    try:
        return jobs_for_owner(user=user, session_key=session_key).get(pk=job_id)
    except (Job.DoesNotExist, ValueError):
        return None


def user_stats(*, user) -> dict:
    agg = Job.objects.filter(user=user).aggregate(total=Count("id"), saved=Sum("bytes_saved"))
    return {"jobs": agg["total"] or 0, "bytesSaved": agg["saved"] or 0}


def user_top_tools(*, user, limit: int = 6) -> list[dict]:
    return list(Job.objects.filter(user=user).values("tool").annotate(n=Count("id")).order_by("-n")[:limit])


def tool_health(*, days: int = 7) -> dict[str, dict]:
    since = timezone.now() - timedelta(days=days)
    rows = (
        Job.objects.filter(created_at__gte=since)
        .values("tool")
        .annotate(runs=Count("id"), failed=Count("id", filter=Q(status=Job.Status.FAILED)),
                  avg=Avg(F("finished_at") - F("created_at")))
    )
    return {r["tool"]: r for r in rows}


def daily_runs(*, days: int = 14) -> list[dict]:
    today = timezone.now().date()
    counts = dict(
        Job.objects.filter(created_at__date__gt=today - timedelta(days=days))
        .values_list("created_at__date")
        .annotate(n=Count("id"))
    )
    return [{"day": (d := today - timedelta(days=i)).isoformat(), "runs": counts.get(d, 0)} for i in range(days - 1, -1, -1)]
