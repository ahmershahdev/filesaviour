from django import forms

from .models import Message


class MessageForm(forms.ModelForm):
    # Honeypot: hidden from people, filled in by naive bots.
    website = forms.CharField(required=False)

    class Meta:
        model = Message
        fields = ["name", "email", "topic", "body"]
        error_messages = {
            "name": {"required": "Tell us what to call you."},
            "email": {"required": "We need an email to reply to.", "invalid": "That email doesn't look right."},
            "body": {"required": "Write a short message."},
        }

    def clean_body(self):
        body = self.cleaned_data["body"].strip()
        if len(body) < 20:
            raise forms.ValidationError("A little more detail, please (at least 20 characters).")
        return body

    @property
    def is_spam(self) -> bool:
        return bool(self.cleaned_data.get("website"))
