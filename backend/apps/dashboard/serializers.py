from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.bookings.serializers import BookingSerializer
from apps.sessions_app.serializers import SessionSerializer


# ── User Dashboard ────────────────────────────────────────────────────────────

class UserBookingStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    confirmed = serializers.IntegerField()
    cancelled = serializers.IntegerField()


class UserDashboardSerializer(serializers.Serializer):
    """Single-response payload for the user dashboard."""
    profile = UserSerializer()
    stats = UserBookingStatsSerializer()
    recent_bookings = BookingSerializer(many=True)
    upcoming_bookings = BookingSerializer(many=True)
    past_bookings = BookingSerializer(many=True)


# ── Creator Dashboard ─────────────────────────────────────────────────────────

class CreatorOverviewStatsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class CreatorDashboardSerializer(serializers.Serializer):
    """Single-response payload for the creator dashboard."""
    profile = UserSerializer()
    stats = CreatorOverviewStatsSerializer()
    recent_sessions = SessionSerializer(many=True)
    recent_bookings = BookingSerializer(many=True)
    top_sessions = SessionSerializer(many=True)
