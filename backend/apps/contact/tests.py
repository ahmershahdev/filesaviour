from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings

from .models import Message

VITE_DEV = {"default": {"dev_mode": True, "dev_server_port": 5173}}
VALID = {"name": "Ada", "email": "ada@example.com", "topic": "bug", "body": "Merge PDF fails on a 300-page file."}


@override_settings(DJANGO_VITE=VITE_DEV, ALLOWED_HOSTS=["testserver"])
class ContactFormTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_valid_message_is_saved_and_forwarded_with_reply_to(self):
        r = self.client.post("/contact", VALID)
        self.assertEqual(r.status_code, 302)
        self.assertEqual(Message.objects.get().topic, "bug")
        self.assertEqual(mail.outbox[0].reply_to, ["ada@example.com"])

    def test_invalid_message_returns_field_errors(self):
        r = self.client.post("/contact", {**VALID, "email": "nope", "body": "short"})
        self.assertEqual(r.status_code, 200)
        self.assertFalse(Message.objects.exists())
        self.assertIn("email doesn", r.content.decode())

    def test_honeypot_pretends_success_but_drops_the_message(self):
        r = self.client.post("/contact", {**VALID, "website": "http://spam.example"})
        self.assertEqual(r.status_code, 302)
        self.assertFalse(Message.objects.exists())
        self.assertEqual(mail.outbox, [])

    def test_rate_limited_after_five_messages(self):
        for _ in range(5):
            self.client.post("/contact", VALID)
        self.client.post("/contact", VALID)
        self.assertEqual(Message.objects.count(), 5)
