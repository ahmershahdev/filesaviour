from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True)
        return self._create(email, password, **extra)


class User(AbstractUser):
    """Email is the login; `username` is dropped."""

    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=80, blank=True)
    keep_history = models.BooleanField(default=True, help_text="Keep results for 7 days in the dashboard.")
    marketing_opt_in = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []
    objects = UserManager()

    @property
    def display_name(self) -> str:
        return self.name or self.email.split("@")[0]

    def __str__(self):
        return self.email
