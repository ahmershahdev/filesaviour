"""
Staff console (/console): a designed, read-mostly operations view.

The raw Django admin (at settings.DJANGO_ADMIN_PATH) stays available for data
editing; the console is where staff watch tool health and usage.
"""

from datetime import timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Q, Sum
from django.utils import timezone

from apps.accounts.models import User
from apps.blog.models import Post
from apps.core import seo
from apps.core.render import page
from apps.jobs import selectors as job_selectors
from apps.jobs.models import Job
from apps.tools import registry


@staff_member_required(login_url="accounts:login")
def overview(request):
    now = timezone.now()
    day, week = now - timedelta(days=1), now - timedelta(days=7)
    jobs = Job.objects.all()
    last_week = jobs.filter(created_at__gte=week)

    per_tool = job_selectors.tool_health(days=7)
    tools = []
    for t in registry.TOOLS:
        r = per_tool.get(t.slug, {})
        runs, failed, avg = r.get("runs", 0), r.get("failed", 0), r.get("avg")
        tools.append({
            **t.to_card(),
            "runs": runs,
            "failed": failed,
            "failRate": round(failed / runs * 100, 1) if runs else 0,
            "avgMs": int(avg.total_seconds() * 1000) if avg else None,
        })

    return page(
        request, "Console/Overview", seo.noindex("Console", "/console"),
        kpis={
            "runs24h": jobs.filter(created_at__gte=day).count(),
            "runs7d": last_week.count(),
            "failed24h": jobs.filter(created_at__gte=day, status=Job.Status.FAILED).count(),
            "users": User.objects.count(),
            "newUsers7d": User.objects.filter(date_joined__gte=week).count(),
            "bytesSaved7d": last_week.aggregate(s=Sum("bytes_saved"))["s"] or 0,
            "queued": jobs.filter(status__in=[Job.Status.QUEUED, Job.Status.RUNNING]).count(),
            "posts": Post.objects.published().count(),
        },
        daily=job_selectors.daily_runs(days=14),
        tools=sorted(tools, key=lambda t: -t["runs"]),
        failures=[{**j.as_row(), "error": j.error} for j in jobs.filter(status=Job.Status.FAILED)[:15]],
    )


@staff_member_required(login_url="accounts:login")
def users(request):
    q = request.GET.get("q", "").strip()[:80]
    qs = User.objects.annotate(job_count=Count("jobs")).order_by("-date_joined")
    if q:
        qs = qs.filter(Q(email__icontains=q) | Q(name__icontains=q))
    return page(
        request, "Console/Users", seo.noindex("Users", "/console/users"), query=q,
        users=[{"id": u.pk, "email": u.email, "name": u.name, "isStaff": u.is_staff, "jobs": u.job_count,
                "joined": u.date_joined.isoformat(), "lastLogin": u.last_login.isoformat() if u.last_login else None}
               for u in qs[:100]],
    )
