from django.conf import settings
from django.db import models


class Message(models.Model):
    """A contact-form submission. Staff read and resolve these in the admin."""

    class Topic(models.TextChoices):
        HELP = "help", "Help with a tool"
        BUG = "bug", "Report a bug"
        IDEA = "idea", "Suggest a tool"
        SECURITY = "security", "Security report"
        OTHER = "other", "Something else"

    name = models.CharField(max_length=80)
    email = models.EmailField()
    topic = models.CharField(max_length=16, choices=Topic.choices, default=Topic.HELP)
    body = models.TextField(max_length=5000)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    handled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_topic_display()} from {self.email}"
