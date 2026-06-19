from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from .models import User
from .serializers import UserSerializer, UserUpdateSerializer, RoleUpdateSerializer
from .tokens import get_tokens_for_user


class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Body: { "token": "<google_id_token>" }
    Response: { "access": "", "refresh": "", "user": {} }
    """
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
            # Keep name and avatar in sync with Google profile on each login
            changed = False
            if name and user.name != name:
                user.name = name
                changed = True
            if avatar and user.avatar != avatar:
                user.avatar = avatar
                changed = True
            if changed:
                user.save(update_fields=["name", "avatar"])

        tokens = get_tokens_for_user(user)
        return Response(
            {**tokens, "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Body: { "refresh": "<refresh_token>" }
    Blacklists the refresh token so it cannot be reused.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Token is invalid or already blacklisted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/me/  — return current user profile
    PATCH /api/auth/me/ — update name / avatar
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer


class RoleUpdateView(APIView):
    """
    PATCH /api/auth/role/
    Body: { "role": "CREATOR" }
    Allows a USER to self-upgrade to CREATOR.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = RoleUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Re-issue tokens so the new role is embedded immediately
        tokens = get_tokens_for_user(request.user)
        return Response(
            {**tokens, "user": UserSerializer(request.user).data},
            status=status.HTTP_200_OK,
        )
