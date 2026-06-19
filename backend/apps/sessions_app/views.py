from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Session
from .serializers import SessionSerializer, SessionWriteSerializer
from .filters import SessionFilter
from apps.users.permissions import IsCreator


class SessionViewSet(viewsets.ModelViewSet):
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
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsCreator()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def get_queryset(self):
        # For write actions, creators can only touch their own sessions
        if self.action in ("update", "partial_update", "destroy"):
            return Session.objects.filter(creator=self.request.user)
        return Session.objects.select_related("creator").all()
