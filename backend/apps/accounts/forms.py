from django import forms
from django.contrib.auth import password_validation

from .models import User


class RegisterForm(forms.Form):
    name = forms.CharField(max_length=80, required=False)
    email = forms.EmailField()
    password = forms.CharField()
    accept_terms = forms.BooleanField(error_messages={"required": "Please accept the Terms and Privacy Policy."})

    def clean_email(self):
        email = self.cleaned_data["email"].lower()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def clean_password(self):
        password = self.cleaned_data["password"]
        password_validation.validate_password(password)
        return password


class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField()
    remember = forms.BooleanField(required=False)


class SettingsForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["name", "keep_history", "marketing_opt_in"]


def errors_of(form) -> dict:
    return {field: errs[0] for field, errs in form.errors.items()}
