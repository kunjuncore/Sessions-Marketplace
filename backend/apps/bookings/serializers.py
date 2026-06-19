from rest_framework import serializers
from .models import Booking
from apps.sessions_app.serializers import SessionSerializer
from apps.users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "user", "session", "status", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["session", "status"]
        read_only_fields = ["status"]

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        session = attrs["session"]

        # Creator cannot book their own session
        if session.creator == user:
            raise serializers.ValidationError(
                "You cannot book your own session."
            )

        # Prevent duplicate booking
        if Booking.objects.filter(user=user, session=session).exists():
            raise serializers.ValidationError(
                "You have already booked this session."
            )

        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class BookingStatusSerializer(serializers.ModelSerializer):
    """Used by creators to update booking status."""

    class Meta:
        model = Booking
        fields = ["status"]

    def validate_status(self, value):
        allowed = [Booking.Status.CONFIRMED, Booking.Status.CANCELLED]
        if value not in allowed:
            raise serializers.ValidationError(
                "Status must be CONFIRMED or CANCELLED."
            )
        return value
