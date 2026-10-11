import json

from django.conf import settings
from django.contrib import messages
from django.shortcuts import redirect

from apps.accounts.forms import errors_of
from apps.core import seo
from apps.core.ratelimit import limited
from apps.core.render import page

from . import services
from .forms import MessageForm
from .models import Message


def _meta() -> seo.Meta:
    title = "Contact FileSaviour — Support, Feedback & Partnerships"
    desc = (f"Get help with a tool, report a bug or suggest a new one. Email {settings.SUPPORT_EMAIL}; "
            "we reply within two working days.")
    graph = seo.site_graph(seo.webpage("ContactPage", title, desc, "/contact"), seo.breadcrumbs(("Contact", "/contact")))
    return seo.Meta(title=title, description=desc, path="/contact", jsonld=graph)


def contact(request):
    errors = {}
    if request.method == "POST":
        data = json.loads(request.body or "{}") if request.content_type == "application/json" else request.POST
        form = MessageForm(data)
        if limited(request, "contact", limit=5, window=60 * 60):
            errors = {"body": f"You've sent several messages already. Email {settings.SUPPORT_EMAIL} directly."}
        elif form.is_valid():
            if not form.is_spam:
                services.message_submit(**{k: form.cleaned_data[k] for k in ("name", "email", "topic", "body")},
                                        user=request.user if request.user.is_authenticated else None)
            messages.success(request, "Message sent. We'll reply within two working days.")
            request.session["contact_sent"] = True
            return redirect("contact:index")
        else:
            errors = errors_of(form)

    return page(
        request, "Contact", _meta(), errors=errors,
        topics=[{"value": v, "label": label} for v, label in Message.Topic.choices],
        sent=request.session.pop("contact_sent", False),
    )
