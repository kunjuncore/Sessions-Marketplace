from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet

router = DefaultRouter()
router.register(r"", SessionViewSet, basename="session")

# The router auto-generates:
#   GET    /api/sessions/          — list
#   POST   /api/sessions/          — create
#   GET    /api/sessions/{id}/     — retrieve
#   PUT    /api/sessions/{id}/     — update
#   PATCH  /api/sessions/{id}/     — partial_update
#   DELETE /api/sessions/{id}/     — destroy
#   GET    /api/sessions/my/       — my_sessions (extra action)
#   GET    /api/sessions/stats/    — stats (extra action)
#   DELETE /api/sessions/{id}/image/ — remove_image (extra action)

urlpatterns = [
    path("", include(router.urls)),
]
