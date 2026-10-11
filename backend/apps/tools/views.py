from django.http import Http404

from apps.core import seo
from apps.core.render import page

from . import registry


def index(request):
    title = "All 42 Tools — PDF, Image, AI Writing & Utilities | FileSaviour"
    desc = "Browse every FileSaviour tool: 18 PDF tools, 12 image tools, 8 AI writing tools and 4 utilities. All free and online."
    meta = seo.Meta(title=title, description=desc, path="/tools",
                    jsonld=seo.site_graph(seo.webpage("CollectionPage", title, desc, "/tools"),
                                          seo.item_list("All FileSaviour tools", "/tools", registry.TOOLS),
                                          seo.breadcrumbs(("Tools", "/tools"))))
    return page(request, "Tools/Index", meta, query=request.GET.get("q", "")[:80])


def category(request, slug: str):
    cat = registry.categories()[slug]
    path = registry.CATEGORY_PATHS[slug]
    tools = registry.in_category(slug)
    title = f"{cat.hub_title} — {len(tools)} Tools | FileSaviour"
    meta = seo.Meta(title=title, description=cat.description + " Free, fast and private.", path=path,
                    jsonld=seo.site_graph(seo.webpage("CollectionPage", title, cat.description, path),
                                          seo.item_list(cat.name, path, tools),
                                          seo.breadcrumbs(("Tools", "/tools"), (cat.name, path))))
    return page(request, "Tools/Category", meta, category=cat.slug)


def detail(request, slug: str):
    tool = registry.get(slug)
    if tool is None:
        raise Http404
    cat = registry.categories()[tool.category]
    steps = registry.howto_steps(tool)
    faqs = registry.faqs(tool)
    meta = seo.Meta(
        title=tool.title,
        description=tool.summary,
        path=tool.path,
        image=f"/og/{tool.slug}.png",
        jsonld=seo.tool_jsonld(tool, cat, registry.CATEGORY_PATHS[cat.slug], steps, faqs),
    )
    return page(
        request,
        "Tools/Show",
        meta,
        tool=tool.to_dict(),
        steps=steps,
        faqs=faqs,
        runtimeCopy=registry.RUNTIME_COPY[tool.runtime],
        related=[registry.get(s).to_card() for s in tool.related],
    )
