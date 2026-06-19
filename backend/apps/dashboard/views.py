from decimal import Decimal
from django.db.models import Count, Sum, Q
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsCreator
from apps.users.serializers import UserSerializer
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingSerializer
from apps.sessions_app.models import Session
from apps.sessions_app.serializers import SessionSerializer


class UserDashboardView(APIView):
    """
    GET /api/dashboard/user/
    Returns a single composite payload for the user dashboard:
      - profile
      - booking stats (total / pending / confirmed / cancelled)
      - recent bookings (last 5)
      - upcoming bookings (CONFIRMED, ordered by creation desc)
      - past bookings (CANCELLED, ordered by creation desc)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        base_qs = (
            Booking.objects.filter(user=user)
            .select_related("session__creator", "user")
        )

        # Aggregate counts in a single query
        agg = base_qs.aggregate(
            total=Count("id"),
            pending=Count("id", filter=Q(status=Booking.Status.PENDING)),
            confirmed=Count("id", filter=Q(status=Booking.Status.CONFIRMED)),
            cancelled=Count("id", filter=Q(status=Booking.Status.CANCELLED)),
        )

        recent_bookings = list(base_qs.order_by("-created_at")[:5])
        upcoming_bookings = list(
            base_qs.filter(status=Booking.Status.CONFIRMED).order_by("-created_at")[:5]
        )
        past_bookings = list(
            base_qs.filter(status=Booking.Status.CANCELLED).order_by("-created_at")[:5]
        )

        ctx = {"request": request}
        data = {
            "profile": UserSerializer(user, context=ctx).data,
            "stats": agg,
            "recent_bookings": BookingSerializer(recent_bookings, many=True, context=ctx).data,
            "upcoming_bookings": BookingSerializer(upcoming_bookings, many=True, context=ctx).data,
            "past_bookings": BookingSerializer(past_bookings, many=True, context=ctx).data,
        }
        return Response(data)


class CreatorDashboardView(APIView):
    """
    GET /api/dashboard/creator/
    Returns a single composite payload for the creator dashboard:
      - profile
      - aggregate stats (sessions, bookings by status, revenue)
      - recent sessions (last 5)
      - recent bookings across all sessions (last 5)
      - top sessions by booking count (top 5)
    """

    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def get(self, request):
        user = request.user
        ctx = {"request": request}

        sessions_qs = Session.objects.filter(creator=user)
        bookings_qs = (
            Booking.objects.filter(session__creator=user)
            .select_related("session__creator", "user")
        )

        # Single-pass aggregation
        booking_agg = bookings_qs.aggregate(
            total_bookings=Count("id"),
            pending_bookings=Count("id", filter=Q(status=Booking.Status.PENDING)),
            confirmed_bookings=Count("id", filter=Q(status=Booking.Status.CONFIRMED)),
            cancelled_bookings=Count("id", filter=Q(status=Booking.Status.CANCELLED)),
        )

        revenue = bookings_qs.filter(
            status=Booking.Status.CONFIRMED
        ).aggregate(total=Sum("session__price"))["total"] or Decimal("0.00")

        stats = {
            "total_sessions": sessions_qs.count(),
            "total_revenue": revenue,
            **booking_agg,
        }

        # Recent sessions with booking count annotation
        recent_sessions = list(
            sessions_qs.annotate(bookings_count=Count("bookings"))
            .select_related("creator")
            .order_by("-created_at")[:5]
        )

        # Top sessions by number of bookings
        top_sessions = list(
            sessions_qs.annotate(bookings_count=Count("bookings"))
            .select_related("creator")
            .order_by("-bookings_count")[:5]
        )

        recent_bookings = list(bookings_qs.order_by("-created_at")[:5])

        data = {
            "profile": UserSerializer(user, context=ctx).data,
            "stats": stats,
            "recent_sessions": SessionSerializer(recent_sessions, many=True, context=ctx).data,
            "recent_bookings": BookingSerializer(recent_bookings, many=True, context=ctx).data,
            "top_sessions": SessionSerializer(top_sessions, many=True, context=ctx).data,
        }
        return Response(data)
