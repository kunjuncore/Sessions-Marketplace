from decimal import Decimal
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.sessions_app.models import Session
from apps.bookings.models import Booking


def auth_header(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


class BookingPermissionTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com", name="Regular User", role=User.Role.USER
        )
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.other_creator = User.objects.create_user(
            email="other@example.com", name="Other Creator", role=User.Role.CREATOR
        )
        self.session = Session.objects.create(
            creator=self.creator,
            title="Live Coding",
            description="Desc",
            price=Decimal("99.00"),
            duration=90,
        )

    # ── Create booking ───────────────────────────────────────────────────────

    def test_user_can_book_session(self):
        response = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_creator_cannot_book_own_session(self):
        response = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_booking_rejected(self):
        Booking.objects.create(user=self.user, session=self.session)
        response = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_anonymous_cannot_book(self):
        response = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── My bookings ──────────────────────────────────────────────────────────

    def test_user_sees_own_bookings_only(self):
        other_user = User.objects.create_user(
            email="other_user@example.com", name="Other User", role=User.Role.USER
        )
        Booking.objects.create(user=self.user, session=self.session)
        session2 = Session.objects.create(
            creator=self.creator, title="S2", description="D", price=Decimal("10"), duration=30
        )
        Booking.objects.create(user=other_user, session=session2)

        response = self.client.get("/api/bookings/my/", **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    # ── Creator bookings ─────────────────────────────────────────────────────

    def test_creator_sees_bookings_for_own_sessions(self):
        Booking.objects.create(user=self.user, session=self.session)
        response = self.client.get("/api/bookings/creator/", **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_user_cannot_access_creator_bookings(self):
        response = self.client.get("/api/bookings/creator/", **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Booking status update ────────────────────────────────────────────────

    def test_creator_can_confirm_booking(self):
        booking = Booking.objects.create(user=self.user, session=self.session)
        response = self.client.patch(
            f"/api/bookings/{booking.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.CONFIRMED)

    def test_other_creator_cannot_update_booking_status(self):
        booking = Booking.objects.create(user=self.user, session=self.session)
        response = self.client.patch(
            f"/api/bookings/{booking.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
            **auth_header(self.other_creator),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_booking_status(self):
        booking = Booking.objects.create(user=self.user, session=self.session)
        response = self.client.patch(
            f"/api/bookings/{booking.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
