from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from .models import User
from .serializers import UserSerializer, UserUpdateSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"detail": "Google token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as exc:
            return Response(
                {"detail": f"Invalid Google token: {str(exc)}"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = idinfo.get("email")
        name = idinfo.get("name", "")
        avatar = idinfo.get("picture", "")

        if not email:
            return Response(
                {"detail": "Email not provided by Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"name": name, "avatar": avatar},
        )

        if not created:
            # Keep avatar in sync with Google profile
            updated = False
            if avatar and user.avatar != avatar:
                user.avatar = avatar
                updated = True
            if updated:
                user.save()

        tokens = get_tokens_for_user(user)
        return Response(
            {**tokens, "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer
