from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Session
from .serializers import SessionSerializer, SessionWriteSerializer
from .filters import SessionFilter
from apps.users.permissions import IsCreator, IsSessionOwner


class SessionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/sessions/        — public list (paginated, filterable)
    GET    /api/sessions/:id/    — public detail
    POST   /api/sessions/        — CREATOR only
    PUT    /api/sessions/:id/    — CREATOR + owner only
    PATCH  /api/sessions/:id/    — CREATOR + owner only
    DELETE /api/sessions/:id/    — CREATOR + owner only
    """

    queryset = Session.objects.select_related("creator").all()
    filterset_class = SessionFilter
    search_fields = ["title", "description", "creator__name"]
    ordering_fields = ["price", "duration", "created_at"]
    ordering = ["-created_at"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SessionWriteSerializer
        return SessionSerializer

    def get_permissions(self):
        if self.action == "create":
            # Must be authenticated + CREATOR role
            return [permissions.IsAuthenticated(), IsCreator()]
        if self.action in ("update", "partial_update", "destroy"):
            # Must be authenticated + CREATOR role + own the session (object-level)
            return [permissions.IsAuthenticated(), IsCreator(), IsSessionOwner()]
        # list / retrieve — public
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def get_queryset(self):
        return Session.objects.select_related("creator").all()
