"""Account write operations."""

from django.db import transaction

from .models import User


@transaction.atomic
def user_create(*, email: str, password: str, name: str = "") -> User:
    return User.objects.create_user(email=email, password=password, name=name)


def user_delete(*, user: User) -> None:
    """Hard delete. Jobs cascade, and each Job's post_delete signal removes its files."""
    user.delete()
