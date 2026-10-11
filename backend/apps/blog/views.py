from django.conf import settings
from django.contrib.syndication.views import Feed
from django.shortcuts import get_object_or_404
from django.utils.feedgenerator import Rss201rev2Feed

from apps.core import seo
from apps.core.render import page
from apps.tools import registry

from .models import Post


def index(request):
    title = "FileSaviour Blog — Guides for PDFs, Images & Better Writing"
    desc = "Practical guides on compressing, converting and editing files, plus writing tips and product updates."
    posts = Post.objects.published()[:30]
    meta = seo.Meta(title=title, description=desc, path="/blog",
                    jsonld=seo.site_graph(seo.webpage("Blog", title, desc, "/blog"), seo.breadcrumbs(("Blog", "/blog"))))
    return page(request, "Blog/Index", meta, posts=[p.as_card() for p in posts])


def show(request, slug: str):
    post = get_object_or_404(Post.objects.published(), slug=slug)
    path = post.get_absolute_url()
    article = {
        "@type": "BlogPosting",
        "@id": f"{seo.absolute(path)}#article",
        "headline": post.title,
        "description": post.excerpt,
        "url": seo.absolute(path),
        "datePublished": post.published_at.isoformat(),
        "dateModified": post.updated_at.isoformat(),
        "author": {"@id": seo.AUTHOR_ID},
        "publisher": {"@id": seo.ORG_ID},
        "mainEntityOfPage": seo.absolute(path),
        "image": seo.absolute(post.cover.url) if post.cover else seo.absolute("/static/brand/og-default.png"),
        "wordCount": len(post.body.split()),
    }
    meta = seo.Meta(title=f"{post.title} | FileSaviour Blog", description=post.excerpt, path=path, type="article",
                    image=post.cover.url if post.cover else "/static/brand/og-default.png",
                    published=post.published_at.isoformat(), modified=post.updated_at.isoformat(),
                    jsonld=seo.site_graph(article, seo.breadcrumbs(("Blog", "/blog"), (post.title, path))))
    return page(request, "Blog/Show", meta, post={**post.as_card(), "body": post.body},
                tools=[registry.get(s).to_card() for s in post.tools if registry.get(s)])


class LatestPostsFeed(Feed):
    feed_type = Rss201rev2Feed
    title = "FileSaviour Blog"
    link = "/blog"
    description = "Guides for PDFs, images and better writing from FileSaviour."
    author_name = settings.SITE_AUTHOR

    def items(self):
        return Post.objects.published()[:30]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.excerpt

    def item_link(self, item):
        return seo.absolute(item.get_absolute_url())

    def item_pubdate(self, item):
        return item.published_at

    def item_updateddate(self, item):
        return item.updated_at

    def get_feed(self, obj, request):
        feed = super().get_feed(obj, request)
        feed.feed["link"] = seo.absolute("/blog")
        feed.feed["feed_url"] = seo.absolute("/rss.xml")
        return feed
