import json

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.http import require_POST
from inertia.http import clear_history

from apps.core import seo
from apps.core.ratelimit import limited
from apps.core.render import page
from apps.jobs import selectors as job_selectors
from apps.tools import registry

from . import services
from .forms import ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm, SettingsForm, errors_of


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
        if limited(request, "login", limit=10, window=15 * 60):
            errors = {"email": "Too many attempts. Wait a few minutes and try again."}
        elif form.is_valid():
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
            user = services.user_create(
                email=form.cleaned_data["email"], password=form.cleaned_data["password"], name=form.cleaned_data["name"]
            )
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            messages.success(request, "Welcome to FileSaviour. Your account is ready.")
            return redirect("accounts:dashboard")
        errors = errors_of(form)
    return page(request, "Auth/Register", seo.noindex("Create account", "/account/register"), errors=errors)


def forgot_password_view(request):
    errors = {}
    if request.method == "POST":
        form = ForgotPasswordForm(_data(request))
        if limited(request, "forgot", limit=5, window=15 * 60):
            errors = {"email": "Too many requests. Wait a few minutes and try again."}
        elif form.is_valid():
            services.password_reset_request(email=form.cleaned_data["email"])
            # Same answer whether or not the account exists.
            request.session["reset_sent_to"] = form.cleaned_data["email"]
            return redirect("accounts:forgot")
        else:
            errors = errors_of(form)
    return page(
        request, "Auth/ForgotPassword", seo.noindex("Forgot password", "/account/forgot-password"),
        errors=errors, sentTo=request.session.pop("reset_sent_to", None),
    )


def reset_password_view(request, uidb64: str, token: str):
    user = services.password_reset_user(uidb64=uidb64, token=token)
    errors = {}
    if user and request.method == "POST":
        form = ResetPasswordForm(_data(request), user=user)
        if form.is_valid():
            services.password_reset_confirm(user=user, password=form.cleaned_data["password"])
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            messages.success(request, "Password updated. You're signed in.")
            return redirect("accounts:dashboard")
        errors = errors_of(form)
    return page(
        request, "Auth/ResetPassword", seo.noindex("Choose a new password", request.path),
        valid=user is not None, email=user.email if user else "", errors=errors,
    )


@require_POST
def logout_view(request):
    logout(request)
    clear_history(request)
    return redirect("core:home")


@login_required
def dashboard(request):
    top = job_selectors.user_top_tools(user=request.user)
    return page(
        request,
        "Dashboard/Index",
        seo.noindex("Dashboard", "/dashboard"),
        stats=job_selectors.user_stats(user=request.user),
        favourites=[{**registry.get(r["tool"]).to_card(), "uses": r["n"]} for r in top if registry.get(r["tool"])],
        recent=[j.as_row() for j in job_selectors.jobs_for_owner(user=request.user).order_by("-created_at")[:20]],
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
    services.user_delete(user=user)
    return redirect("core:home")
