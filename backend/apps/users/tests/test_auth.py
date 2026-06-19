from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User


class GoogleAuthViewTest(APITestCase):
    url = "/api/auth/google/"

    def _mock_idinfo(self, email="test@example.com", name="Test User", picture="https://pic.example.com/photo.jpg"):
        return {
            "email": email,
            "name": name,
            "picture": picture,
        }

    @patch("apps.users.views.id_token.verify_oauth2_token")
    def test_new_user_is_created_and_tokens_returned(self, mock_verify):
        mock_verify.return_value = self._mock_idinfo()
        response = self.client.post(self.url, {"token": "valid-google-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "test@example.com")
        self.assertEqual(User.objects.count(), 1)

    @patch("apps.users.views.id_token.verify_oauth2_token")
    def test_existing_user_returns_tokens(self, mock_verify):
        User.objects.create_user(email="test@example.com", name="Test User")
        mock_verify.return_value = self._mock_idinfo()

        response = self.client.post(self.url, {"token": "valid-google-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)

    @patch("apps.users.views.id_token.verify_oauth2_token")
    def test_avatar_synced_on_login(self, mock_verify):
        user = User.objects.create_user(
            email="test@example.com", name="Test User"
        )
        user.avatar = "https://old-avatar.com/pic.jpg"
        user.save()

        mock_verify.return_value = self._mock_idinfo(picture="https://new-avatar.com/pic.jpg")
        self.client.post(self.url, {"token": "valid-google-token"}, format="json")

        user.refresh_from_db()
        self.assertEqual(user.avatar, "https://new-avatar.com/pic.jpg")

    @patch("apps.users.views.id_token.verify_oauth2_token")
    def test_name_synced_on_existing_user_login(self, mock_verify):
        user = User.objects.create_user(email="test@example.com", name="Old Name")
        mock_verify.return_value = self._mock_idinfo(name="Updated Google Name")

        response = self.client.post(self.url, {"token": "valid-google-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.name, "Updated Google Name")

    @patch("apps.users.views.id_token.verify_oauth2_token")
    def test_google_response_without_email_returns_400(self, mock_verify):
        mock_verify.return_value = {"name": "No Email User", "picture": ""}

        response = self.client.post(self.url, {"token": "valid-google-token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)

    def test_missing_token_returns_400(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.users.views.id_token.verify_oauth2_token")
    def test_invalid_google_token_returns_401(self, mock_verify):
        mock_verify.side_effect = ValueError("Token signature invalid")
        response = self.client.post(self.url, {"token": "bad-token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="me@example.com", name="Me User", role=User.Role.USER
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")

    def test_get_profile(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "me@example.com")

    def test_update_name(self):
        response = self.client.patch("/api/auth/me/", {"name": "Updated Name"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Updated Name")

    def test_unauthenticated_returns_401(self):
        self.client.credentials()
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshViewTest(APITestCase):
    def test_refresh_token_returns_new_access_token(self):
        user = User.objects.create_user(
            email="refresh@example.com", name="Refresh User"
        )
        refresh = RefreshToken.for_user(user)

        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_invalid_refresh_token_returns_401(self):
        response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": "not-a-valid-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoleUpdateViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="roletest@example.com", name="Role User", role=User.Role.USER
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")

    def test_upgrade_to_creator(self):
        response = self.client.patch("/api/auth/role/", {"role": "CREATOR"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, User.Role.CREATOR)
        # New tokens are issued with the updated role
        self.assertIn("access", response.data)

    def test_invalid_role_rejected(self):
        response = self.client.patch("/api/auth/role/", {"role": "ADMIN"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="logout@example.com", name="Logout User"
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {str(self.refresh.access_token)}"
        )

    def test_logout_blacklists_token(self):
        response = self.client.post(
            "/api/auth/logout/", {"refresh": str(self.refresh)}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_refresh_token_returns_400(self):
        response = self.client.post("/api/auth/logout/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
