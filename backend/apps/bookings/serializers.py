from rest_framework import serializers
from .models import Booking
from apps.sessions_app.serializers import SessionSerializer
from apps.users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Full read serializer — used in list and detail responses."""

    session = SessionSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ["id", "user", "session", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Used by any authenticated user to book a session."""

    class Meta:
        model = Booking
        fields = ["session"]

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        session = attrs["session"]

        # Creators cannot book their own sessions
        if session.creator == user:
            raise serializers.ValidationError(
                {"session": "You cannot book your own session."}
            )

        # Prevent duplicate active bookings
        existing = Booking.objects.filter(user=user, session=session).first()
        if existing:
            if existing.status == Booking.Status.CANCELLED:
                raise serializers.ValidationError(
                    {"session": "You have a cancelled booking for this session. Contact support to rebook."}
                )
            raise serializers.ValidationError(
                {"session": "You have already booked this session."}
            )

        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class BookingCancelSerializer(serializers.ModelSerializer):
    """Used by a user to cancel their own booking."""

    class Meta:
        model = Booking
        fields = ["status"]
        read_only_fields = ["status"]

    def validate(self, attrs):
        booking = self.instance
        if booking.status == Booking.Status.CANCELLED:
            raise serializers.ValidationError("This booking is already cancelled.")
        if booking.status == Booking.Status.CONFIRMED:
            raise serializers.ValidationError(
                "Confirmed bookings cannot be cancelled by the user. Contact the creator."
            )
        return attrs

    def update(self, instance, validated_data):
        instance.status = Booking.Status.CANCELLED
        instance.save(update_fields=["status", "updated_at"])
        return instance


class BookingStatusSerializer(serializers.ModelSerializer):
    """Used by creators to move a booking to CONFIRMED or CANCELLED."""

    class Meta:
        model = Booking
        fields = ["status"]

    def validate_status(self, value):
        allowed = [Booking.Status.CONFIRMED, Booking.Status.CANCELLED]
        if value not in allowed:
            raise serializers.ValidationError("Status must be CONFIRMED or CANCELLED.")
        return value

    def validate(self, attrs):
        booking = self.instance
        new_status = attrs.get("status")
        # Prevent re-confirming an already confirmed booking
        if booking.status == new_status:
            raise serializers.ValidationError(
                f"Booking is already {booking.status}."
            )
        return attrs
