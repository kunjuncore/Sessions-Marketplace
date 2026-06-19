from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.sessions_app.models import Session


def auth_header(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


class SessionPermissionTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com", name="Regular User", role=User.Role.USER
        )
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Session Creator", role=User.Role.CREATOR
        )
        self.other_creator = User.objects.create_user(
            email="other@example.com", name="Other Creator", role=User.Role.CREATOR
        )
        self.session = Session.objects.create(
            creator=self.creator,
            title="Test Session",
            description="A test session",
            price=Decimal("49.99"),
            duration=60,
        )

    # ── Public access ────────────────────────────────────────────────────────

    def test_anonymous_can_list_sessions(self):
        response = self.client.get("/api/sessions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_can_retrieve_session(self):
        response = self.client.get(f"/api/sessions/{self.session.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ── Create ───────────────────────────────────────────────────────────────

    def test_creator_can_create_session(self):
        data = {"title": "New Session", "description": "Desc", "price": "29.99", "duration": 45}
        response = self.client.post("/api/sessions/", data, **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_create_session(self):
        data = {"title": "Bad Session", "description": "Desc", "price": "29.99", "duration": 45}
        response = self.client.post("/api/sessions/", data, **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_create_session(self):
        data = {"title": "Bad Session", "description": "Desc", "price": "29.99", "duration": 45}
        response = self.client.post("/api/sessions/", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Update ───────────────────────────────────────────────────────────────

    def test_creator_can_update_own_session(self):
        response = self.client.patch(
            f"/api/sessions/{self.session.id}/",
            {"title": "Updated"},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_other_creator_cannot_update_session(self):
        response = self.client.patch(
            f"/api/sessions/{self.session.id}/",
            {"title": "Stolen"},
            format="json",
            **auth_header(self.other_creator),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_session(self):
        response = self.client.patch(
            f"/api/sessions/{self.session.id}/",
            {"title": "Nope"},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Delete ───────────────────────────────────────────────────────────────

    def test_creator_can_delete_own_session(self):
        response = self.client.delete(
            f"/api/sessions/{self.session.id}/", **auth_header(self.creator)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_other_creator_cannot_delete_session(self):
        response = self.client.delete(
            f"/api/sessions/{self.session.id}/", **auth_header(self.other_creator)
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_delete_session(self):
        response = self.client.delete(
            f"/api/sessions/{self.session.id}/", **auth_header(self.user)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
