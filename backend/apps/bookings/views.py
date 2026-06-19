from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingStatusSerializer
from apps.users.permissions import IsCreator


class BookingCreateView(generics.CreateAPIView):
    """POST /api/bookings/ — any authenticated user can book a session."""
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
    """GET /api/bookings/my/ — bookings belonging to the current user."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("session__creator", "user")
        )


class CreatorBookingsView(generics.ListAPIView):
    """GET /api/creator/bookings/ — all bookings for the creator's sessions."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def get_queryset(self):
        return (
            Booking.objects.filter(session__creator=self.request.user)
            .select_related("session__creator", "user")
        )


class BookingStatusUpdateView(generics.UpdateAPIView):
    """PATCH /api/bookings/<id>/status/ — creator updates booking status."""
    serializer_class = BookingStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Booking.objects.filter(session__creator=self.request.user)
