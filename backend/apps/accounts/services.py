"""Account write operations."""

import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .models import User

log = logging.getLogger(__name__)


@transaction.atomic
def user_create(*, email: str, password: str, name: str = "") -> User:
    return User.objects.create_user(email=email, password=password, name=name)


def user_delete(*, user: User) -> None:
    """Hard delete. Jobs cascade, and each Job's post_delete signal removes its files."""
    user.delete()


def password_reset_request(*, email: str) -> None:
    """Email a one-hour reset link. Silent for unknown emails so accounts can't be enumerated."""
    user = User.objects.filter(email=email.lower(), is_active=True).first()
    if user is None or not user.has_usable_password():
        return
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    context = {
        "name": user.display_name,
        "link": f"{settings.SITE_URL}/account/reset/{uid}/{default_token_generator.make_token(user)}",
        "minutes": settings.PASSWORD_RESET_TIMEOUT // 60,
        "support": settings.SUPPORT_EMAIL,
    }
    mail = EmailMultiAlternatives(
        subject="Reset your FileSaviour password",
        body=render_to_string("emails/password_reset.txt", context),
        to=[user.email],
    )
    mail.attach_alternative(render_to_string("emails/password_reset.html", context), "text/html")
    try:
        mail.send()
    except Exception:  # the response must not reveal whether the account exists
        log.exception("password reset email failed")


def password_reset_user(*, uidb64: str, token: str) -> User | None:
    """The user a reset link belongs to, or None if the link is invalid or expired."""
    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(uidb64)), is_active=True)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return None
    return user if default_token_generator.check_token(user, token) else None


def password_reset_confirm(*, user: User, password: str) -> None:
    """Set the new password. Changing it invalidates the token and every other session."""
    user.set_password(password)
    user.save(update_fields=["password"])
