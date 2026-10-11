from django.db import models
from django.urls import reverse
from django.utils import timezone


class PostQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=Post.Status.PUBLISHED, published_at__lte=timezone.now())


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft"
        PUBLISHED = "published"

    title = models.CharField(max_length=140)
    slug = models.SlugField(max_length=140, unique=True)
    excerpt = models.CharField(max_length=300, help_text="Used for meta description and RSS.")
    body = models.TextField(help_text="Markdown.")
    cover = models.ImageField(upload_to="blog/", blank=True)
    tools = models.JSONField(default=list, blank=True, help_text="Related tool slugs.")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    reading_minutes = models.PositiveSmallIntegerField(default=1)

    objects = PostQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at"]

    def save(self, *args, **kwargs):
        self.reading_minutes = max(1, round(len(self.body.split()) / 230))
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("blog:show", args=[self.slug])

    def as_card(self) -> dict:
        return {
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "path": self.get_absolute_url(),
            "publishedAt": self.published_at.isoformat() if self.published_at else None,
            "readingMinutes": self.reading_minutes,
            "cover": self.cover.url if self.cover else None,
        }

    def __str__(self):
        return self.title
