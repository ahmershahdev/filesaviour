from django.contrib import admin

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "status", "published_at", "reading_minutes"]
    list_filter = ["status"]
    search_fields = ["title", "excerpt", "body"]
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ["reading_minutes", "updated_at"]
