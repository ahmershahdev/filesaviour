from inertia import render as inertia_render

from .seo import Meta


def page(request, component: str, meta: Meta, status: int = 200, **props):
    """Render an Inertia page with SEO meta in both <head> (server) and props (client)."""
    meta_dict = meta.as_dict()
    response = inertia_render(
        request,
        component,
        props={"meta": meta_dict, **props},
        template_data={"meta": meta_dict},
    )
    response.status_code = status
    return response
