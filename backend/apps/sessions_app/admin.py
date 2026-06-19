from django.contrib import admin
from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ["title", "creator", "price", "duration", "created_at"]
    list_filter = ["creator"]
    search_fields = ["title", "description", "creator__email"]
    ordering = ["-created_at"]
    readonly_fields = ["id", "created_at", "updated_at"]
