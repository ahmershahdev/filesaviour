from django.conf import settings
from inertia import once, share

from apps.tools import registry


def inertia_share(get_response):
    """Props every page receives: site info, auth user, tool catalog for nav/palette."""

    def middleware(request):
        share(
            request,
            site=lambda: {
                "name": settings.SITE_NAME,
                "url": settings.SITE_URL,
                "tagline": settings.SITE_TAGLINE,
                "supportEmail": settings.SUPPORT_EMAIL,
                "author": settings.SITE_AUTHOR,
                "authorUrl": settings.SITE_AUTHOR_URL,
                "linkedin": settings.SITE_AUTHOR_LINKEDIN,
                "source": settings.SITE_SOURCE_URL,
            },
            auth=lambda: {
                "user": (
                    {
                        "id": request.user.pk,
                        "email": request.user.email,
                        "name": request.user.display_name,
                        "isStaff": request.user.is_staff,
                        "adminPath": f"/{settings.DJANGO_ADMIN_PATH}" if request.user.is_staff else None,
                    }
                    if request.user.is_authenticated
                    else None
                )
            },
            catalog=once(lambda: {"categories": registry.category_payload(), "tools": registry.catalog()}),
        )
        return get_response(request)

    return middleware
