from decimal import Decimal
from django.db.models import Count, Sum, Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import Session
from .pagination import SessionPagination
from .serializers import SessionSerializer, SessionWriteSerializer, SessionStatsSerializer
from .filters import SessionFilter
from apps.users.permissions import IsCreator, IsSessionOwner


class SessionViewSet(viewsets.ModelViewSet):
    """
    GET    /api/sessions/              — public list (paginated, filterable, searchable)
    GET    /api/sessions/:id/          — public detail
    POST   /api/sessions/              — CREATOR only
    PUT    /api/sessions/:id/          — CREATOR + owner only
    PATCH  /api/sessions/:id/          — CREATOR + owner only
    DELETE /api/sessions/:id/          — CREATOR + owner only
    GET    /api/sessions/my/           — creator's own sessions (auth required)
    GET    /api/sessions/stats/        — creator's aggregate stats
    DELETE /api/sessions/:id/image/    — remove session image
    """

    filterset_class = SessionFilter
    search_fields = ["title", "description", "creator__name"]
    ordering_fields = ["price", "duration", "created_at", "title"]
    ordering = ["-created_at"]
    pagination_class = SessionPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return SessionWriteSerializer
        if self.action == "stats":
            return SessionStatsSerializer
        return SessionSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCreator()]
        if self.action in ("update", "partial_update", "destroy", "remove_image"):
            return [permissions.IsAuthenticated(), IsCreator(), IsSessionOwner()]
        if self.action in ("my_sessions", "stats"):
            return [permissions.IsAuthenticated(), IsCreator()]
        # list / retrieve — public
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Session.objects.select_related("creator").annotate(
            bookings_count=Count("bookings")
        )

        # For write/owner actions, scope to current creator
        if self.action in ("update", "partial_update", "destroy", "remove_image"):
            if self.request.user.is_authenticated:
                return qs.filter(creator=self.request.user)
            return qs.none()

        return qs

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    # ── Extra actions ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="my")
    def my_sessions(self, request):
        """GET /api/sessions/my/ — paginated list of the creator's own sessions."""
        qs = (
            Session.objects.filter(creator=request.user)
            .annotate(bookings_count=Count("bookings"))
            .select_related("creator")
            .order_by("-created_at")
        )

        # Apply search/filter to my-sessions as well
        qs = self.filter_queryset(qs)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = SessionSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = SessionSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """GET /api/sessions/stats/ — aggregate stats for the authenticated creator."""
        from apps.bookings.models import Booking

        creator_sessions = Session.objects.filter(creator=request.user)
        bookings_qs = Booking.objects.filter(session__creator=request.user)

        agg = bookings_qs.aggregate(
            total=Count("id"),
            confirmed=Count("id", filter=Q(status=Booking.Status.CONFIRMED)),
            pending=Count("id", filter=Q(status=Booking.Status.PENDING)),
            cancelled=Count("id", filter=Q(status=Booking.Status.CANCELLED)),
        )

        # Revenue = sum of session prices for CONFIRMED bookings
        revenue_agg = bookings_qs.filter(
            status=Booking.Status.CONFIRMED
        ).aggregate(revenue=Sum("session__price"))

        data = {
            "total_sessions": creator_sessions.count(),
            "total_bookings": agg["total"],
            "confirmed_bookings": agg["confirmed"],
            "pending_bookings": agg["pending"],
            "cancelled_bookings": agg["cancelled"],
            "total_revenue": revenue_agg["revenue"] or Decimal("0.00"),
        }
        serializer = SessionStatsSerializer(data)
        return Response(serializer.data)

    @action(detail=True, methods=["delete"], url_path="image")
    def remove_image(self, request, pk=None):
        """DELETE /api/sessions/:id/image/ — removes the session image."""
        session = self.get_object()
        if session.image:
            session.image.delete(save=False)
            session.image = None
            session.save(update_fields=["image"])
        return Response({"detail": "Image removed."})
