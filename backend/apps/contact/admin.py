from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["created_at", "topic", "name", "email", "handled"]
    list_filter = ["handled", "topic"]
    list_editable = ["handled"]
    search_fields = ["name", "email", "body"]
    readonly_fields = ["name", "email", "topic", "body", "user", "created_at"]
