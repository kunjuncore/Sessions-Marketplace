from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "avatar", "role", "created_at"]
        read_only_fields = ["id", "email", "role", "created_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/auth/me/ — profile fields only, no role change here."""

    class Meta:
        model = User
        fields = ["name", "avatar"]


class RoleUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/auth/role/ — only allows upgrading to CREATOR."""

    class Meta:
        model = User
        fields = ["role"]

    def validate_role(self, value):
        if value not in (User.Role.USER, User.Role.CREATOR):
            raise serializers.ValidationError("Invalid role.")
        return value
