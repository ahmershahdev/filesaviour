import json

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.shortcuts import redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST
from inertia.http import clear_history

from apps.core import seo
from apps.core.render import page
from apps.jobs.models import Job
from apps.tools import registry

from .forms import LoginForm, RegisterForm, SettingsForm, errors_of
from .models import User


def _data(request):
    """Inertia posts JSON; plain HTML forms post form-encoded. Accept both."""
    if request.content_type == "application/json":
        return json.loads(request.body or "{}")
    return request.POST


def _safe_next(request) -> str:
    nxt = request.GET.get("next", "")
    if url_has_allowed_host_and_scheme(nxt, allowed_hosts={request.get_host()}, require_https=request.is_secure()):
        return nxt
    return "accounts:dashboard"


def login_view(request):
    if request.user.is_authenticated:
        return redirect("accounts:dashboard")
    errors = {}
    if request.method == "POST":
        form = LoginForm(_data(request))
        if form.is_valid():
            user = authenticate(request, email=form.cleaned_data["email"], password=form.cleaned_data["password"])
            if user:
                login(request, user)
                if not form.cleaned_data["remember"]:
                    request.session.set_expiry(0)
                return redirect(_safe_next(request))
            errors = {"email": "That email and password don't match."}
        else:
            errors = errors_of(form)
    return page(request, "Auth/Login", seo.noindex("Log in", "/account/login"), errors=errors)


def register_view(request):
    if request.user.is_authenticated:
        return redirect("accounts:dashboard")
    errors = {}
    if request.method == "POST":
        form = RegisterForm(_data(request))
        if form.is_valid():
            user = User.objects.create_user(
                email=form.cleaned_data["email"], password=form.cleaned_data["password"], name=form.cleaned_data["name"]
            )
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            messages.success(request, "Welcome to FileSaviour. Your account is ready.")
            return redirect("accounts:dashboard")
        errors = errors_of(form)
    return page(request, "Auth/Register", seo.noindex("Create account", "/account/register"), errors=errors)


@require_POST
def logout_view(request):
    logout(request)
    clear_history(request)
    return redirect("core:home")


@login_required
def dashboard(request):
    jobs = Job.objects.filter(user=request.user)
    stats = jobs.aggregate(total=Count("id"), saved=Sum("bytes_saved"))
    top = jobs.values("tool").annotate(n=Count("id")).order_by("-n")[:6]
    return page(
        request,
        "Dashboard/Index",
        seo.noindex("Dashboard", "/dashboard"),
        stats={"jobs": stats["total"] or 0, "bytesSaved": stats["saved"] or 0},
        favourites=[{**registry.get(r["tool"]).to_card(), "uses": r["n"]} for r in top if registry.get(r["tool"])],
        recent=[j.as_row() for j in jobs.order_by("-created_at")[:20]],
    )


@login_required
def settings_view(request):
    errors = {}
    if request.method == "POST":
        form = SettingsForm(_data(request), instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Settings saved.")
            return redirect("accounts:settings")
        errors = errors_of(form)
    u = request.user
    return page(
        request,
        "Dashboard/Settings",
        seo.noindex("Settings", "/dashboard/settings"),
        profile={"name": u.name, "email": u.email, "keep_history": u.keep_history, "marketing_opt_in": u.marketing_opt_in},
        errors=errors,
    )


@login_required
@require_POST
def delete_account(request):
    user = request.user
    logout(request)
    clear_history(request)
    user.delete()  # cascades to jobs; stored files are removed by the Job post_delete signal
    return redirect("core:home")
