from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingStatusSerializer
from apps.users.permissions import IsCreator, IsBookingSessionCreator


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/
    Any authenticated user can book a session.
    Creators cannot book their own sessions (validated in serializer).
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
    Returns all bookings belonging to the currently authenticated user.
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("session__creator", "user")
            .order_by("-created_at")
        )


class CreatorBookingsView(generics.ListAPIView):
    """
    GET /api/bookings/creator/
    Returns all bookings across the authenticated creator's sessions.
    Restricted to CREATOR role only.
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def get_queryset(self):
        return (
            Booking.objects.filter(session__creator=self.request.user)
            .select_related("session__creator", "user")
            .order_by("-created_at")
        )


class BookingStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/bookings/<uuid:pk>/status/
    Creator updates a booking's status to CONFIRMED or CANCELLED.
    Object-level check ensures creator only touches their own session bookings.
    """

    serializer_class = BookingStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingSessionCreator]
    http_method_names = ["patch"]

    def get_queryset(self):
        # Scoped at queryset level AND object-level via IsBookingSessionCreator
        return Booking.objects.filter(
            session__creator=self.request.user
        ).select_related("session__creator")
