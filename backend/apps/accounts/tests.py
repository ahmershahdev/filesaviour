import re

from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings

from .models import User

VITE_DEV = {"default": {"dev_mode": True, "dev_server_port": 5173}}


@override_settings(DJANGO_VITE=VITE_DEV, ALLOWED_HOSTS=["testserver"])
class PasswordResetTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(email="ada@example.com", password="old-password-123")

    def test_reset_flow_sets_new_password_and_burns_the_link(self):
        self.assertEqual(self.client.post("/account/forgot-password", {"email": "ADA@example.com"}).status_code, 302)
        link = re.search(r"https?://\S+/account/reset/\S+", mail.outbox[0].body).group(0)
        path = link.split("://", 1)[1].split("/", 1)[1]
        r = self.client.post(f"/{path}", {"password": "a-brand-new-passphrase"})
        self.assertRedirects(r, "/dashboard", fetch_redirect_response=False)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("a-brand-new-passphrase"))
        self.assertIn('"valid": false', self.client.get(f"/{path}").content.decode().replace("&quot;", '"'))

    def test_unknown_email_looks_identical_and_sends_nothing(self):
        r = self.client.post("/account/forgot-password", {"email": "ghost@example.com"})
        self.assertEqual(r.status_code, 302)
        self.assertEqual(mail.outbox, [])

    def test_bad_token_is_rejected(self):
        self.client.post("/account/reset/MQ/bad-token", {"password": "a-brand-new-passphrase"})
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("old-password-123"))
