from django.contrib import admin

from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["id", "tool", "runtime", "status", "user", "input_bytes", "output_bytes", "created_at"]
    list_filter = ["status", "runtime", "tool"]
    search_fields = ["id", "tool", "user__email"]
    readonly_fields = [f.name for f in Job._meta.fields]
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False
