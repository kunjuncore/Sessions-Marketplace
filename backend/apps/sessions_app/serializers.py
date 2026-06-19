from rest_framework import serializers
from .models import Session
from apps.users.serializers import UserSerializer


class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "id", "creator", "title", "description",
            "price", "image", "image_url", "duration",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "creator", "created_at", "updated_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


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
