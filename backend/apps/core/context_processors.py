from django.conf import settings


def site(request):
    return {"SITE_URL": settings.SITE_URL, "SITE_NAME": settings.SITE_NAME}
