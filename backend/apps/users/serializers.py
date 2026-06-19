from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "avatar", "role", "created_at"]
        read_only_fields = ["id", "email", "created_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "avatar", "role"]

    def validate_role(self, value):
        # Only allow upgrading to CREATOR, never downgrading via API
        allowed = [User.Role.USER, User.Role.CREATOR]
        if value not in allowed:
            raise serializers.ValidationError("Invalid role.")
        return value
