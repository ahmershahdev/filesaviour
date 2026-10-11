"""Contact-form writes."""

import logging

from django.conf import settings
from django.core.mail import EmailMessage

from .models import Message

log = logging.getLogger(__name__)


def message_submit(*, name: str, email: str, topic: str, body: str, user=None) -> Message:
    """Store the message, then forward it to support with Reply-To set to the sender."""
    msg = Message.objects.create(name=name, email=email, topic=topic, body=body, user=user)
    mail = EmailMessage(
        subject=f"[FileSaviour] {msg.get_topic_display()}: {name}",
        body=f"From: {name} <{email}>\nTopic: {msg.get_topic_display()}\n\n{body}\n",
        to=[settings.SUPPORT_EMAIL],
        reply_to=[email],
    )
    try:
        mail.send()
    except Exception:  # the message is saved either way; staff see it in the admin
        log.exception("contact notification failed for message %s", msg.pk)
    return msg
