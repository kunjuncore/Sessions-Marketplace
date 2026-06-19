from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomRefreshToken(RefreshToken):
    """Adds user claims to both access and refresh tokens."""

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["email"] = user.email
        token["name"] = user.name
        token["role"] = user.role
        token["avatar"] = user.avatar or ""
        return token


def get_tokens_for_user(user):
    refresh = CustomRefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
