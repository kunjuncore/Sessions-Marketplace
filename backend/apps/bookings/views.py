from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Booking
from .pagination import BookingPagination
from .serializers import (
    BookingSerializer,
    BookingCreateSerializer,
    BookingCancelSerializer,
    BookingStatusSerializer,
)
from apps.users.permissions import IsCreator, IsBookingSessionCreator


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/
    Any authenticated user books a session.
    Validation: no self-booking, no duplicates.
    """

    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingSerializer(booking, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class MyBookingsView(generics.ListAPIView):
    """
    GET /api/bookings/my/
    Authenticated user's bookings — filterable by status, paginated.
    Query params:
      ?status=PENDING|CONFIRMED|CANCELLED
      ?ordering=created_at|-created_at
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = BookingPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("session__creator", "user")
        )


class BookingDetailView(generics.RetrieveAPIView):
    """
    GET /api/bookings/<uuid:pk>/
    Retrieve a single booking — accessible by the booking owner or the session creator.
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        from django.shortcuts import get_object_or_404
        from django.db.models import Q
        user = self.request.user
        booking = get_object_or_404(
            Booking.objects.select_related("session__creator", "user"),
            Q(user=user) | Q(session__creator=user),
            pk=self.kwargs["pk"],
        )
        self.check_object_permissions(self.request, booking)
        return booking


class BookingCancelView(generics.UpdateAPIView):
    """
    PATCH /api/bookings/<uuid:pk>/cancel/
    User cancels their own PENDING booking.
    """

    serializer_class = BookingCancelSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user, status=Booking.Status.PENDING
        )

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        serializer = self.get_serializer(booking, data={}, partial=True)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingSerializer(booking, context={"request": request}).data
        )


class CreatorBookingsView(generics.ListAPIView):
    """
    GET /api/bookings/creator/
    All bookings for the authenticated creator's sessions.
    Filterable by status and session, paginated.
    Query params:
      ?status=PENDING|CONFIRMED|CANCELLED
      ?session=<uuid>
      ?ordering=created_at|-created_at
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]
    pagination_class = BookingPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "session"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Booking.objects.filter(session__creator=self.request.user)
            .select_related("session__creator", "user")
        )


class BookingStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/bookings/<uuid:pk>/status/
    Creator confirms or cancels a booking on their session.
    """

    serializer_class = BookingStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingSessionCreator]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.filter(
            session__creator=self.request.user
        ).select_related("session__creator", "user")

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        serializer = self.get_serializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingSerializer(booking, context={"request": request}).data
        )


class BookingStatsView(APIView):
    """
    GET /api/bookings/stats/
    Returns booking counts by status for the authenticated creator.
    """

    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def get(self, request):
        from django.db.models import Count, Q
        qs = Booking.objects.filter(session__creator=request.user)
        agg = qs.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status=Booking.Status.PENDING)),
            confirmed=Count("id", filter=Q(status=Booking.Status.CONFIRMED)),
            cancelled=Count("id", filter=Q(status=Booking.Status.CANCELLED)),
        )
        return Response(agg)
