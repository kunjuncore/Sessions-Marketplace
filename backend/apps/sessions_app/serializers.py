from rest_framework import serializers
from .models import Session
from apps.users.serializers import UserSerializer


class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    booking_count = serializers.SerializerMethodField()
    is_booked = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "id",
            "creator",
            "title",
            "description",
            "price",
            "image",
            "image_url",
            "duration",
            "booking_count",
            "is_booked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "creator", "created_at", "updated_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_booking_count(self, obj):
        # Uses prefetched bookings when available, otherwise hits DB
        if hasattr(obj, "bookings_count"):
            return obj.bookings_count
        return obj.bookings.count()

    def get_is_booked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if hasattr(obj, "user_has_booked"):
            return obj.user_has_booked
        return obj.bookings.filter(user=request.user).exists()


class SessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ["title", "description", "price", "image", "duration"]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_duration(self, value):
        if value < 1:
            raise serializers.ValidationError("Duration must be at least 1 minute.")
        return value


class SessionStatsSerializer(serializers.Serializer):
    """Read-only stats for a creator's dashboard."""
    total_sessions = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
