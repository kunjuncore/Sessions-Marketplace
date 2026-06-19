from decimal import Decimal
import uuid

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.sessions_app.models import Session
from apps.bookings.models import Booking


def auth_header(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


def make_user(email, name, role=User.Role.USER):
    return User.objects.create_user(email=email, name=name, role=role)


def make_session(creator, title="Test Session", price="49.99", duration=60):
    return Session.objects.create(
        creator=creator,
        title=title,
        description="Great content",
        price=Decimal(price),
        duration=duration,
    )


class BookingCreateTest(APITestCase):
    def setUp(self):
        self.user = make_user("user@example.com", "User")
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.session = make_session(self.creator)

    def test_user_can_book_session(self):
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "PENDING")
        self.assertIn("session", res.data)
        self.assertIn("user", res.data)

    def test_booking_response_contains_session_detail(self):
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(res.data["session"]["title"], "Test Session")
        self.assertEqual(res.data["user"]["email"], "user@example.com")

    def test_creator_cannot_book_own_session(self):
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("session", res.data)

    def test_duplicate_booking_rejected(self):
        Booking.objects.create(user=self.user, session=self.session)
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancelled_existing_booking_cannot_be_rebooked(self):
        Booking.objects.create(
            user=self.user, session=self.session, status=Booking.Status.CANCELLED
        )
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(self.user),
        )

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cancelled booking", str(res.data["session"]))

    def test_unknown_session_id_rejected(self):
        res = self.client.post(
            "/api/bookings/",
            {"session": str(uuid.uuid4())},
            format="json",
            **auth_header(self.user),
        )

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("session", res.data)

    def test_unauthenticated_cannot_book(self):
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_another_creator_can_book_session(self):
        other_creator = make_user("other@example.com", "Other Creator", User.Role.CREATOR)
        res = self.client.post(
            "/api/bookings/",
            {"session": str(self.session.id)},
            format="json",
            **auth_header(other_creator),
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)


class BookingDetailTest(APITestCase):
    def setUp(self):
        self.user = make_user("user@example.com", "User")
        self.other_user = make_user("other@example.com", "Other User")
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.other_creator = make_user(
            "other-creator@example.com", "Other Creator", User.Role.CREATOR
        )
        self.session = make_session(self.creator)
        self.booking = Booking.objects.create(user=self.user, session=self.session)

    def test_booking_owner_can_retrieve_detail(self):
        res = self.client.get(
            f"/api/bookings/{self.booking.id}/", **auth_header(self.user)
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["id"], str(self.booking.id))

    def test_session_creator_can_retrieve_detail(self):
        res = self.client.get(
            f"/api/bookings/{self.booking.id}/", **auth_header(self.creator)
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["session"]["id"], str(self.session.id))

    def test_unrelated_user_cannot_retrieve_detail(self):
        res = self.client.get(
            f"/api/bookings/{self.booking.id}/", **auth_header(self.other_user)
        )

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_unrelated_creator_cannot_retrieve_detail(self):
        res = self.client.get(
            f"/api/bookings/{self.booking.id}/", **auth_header(self.other_creator)
        )

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cannot_retrieve_detail(self):
        res = self.client.get(f"/api/bookings/{self.booking.id}/")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class MyBookingsTest(APITestCase):
    def setUp(self):
        self.user = make_user("user@example.com", "User")
        self.other_user = make_user("other@example.com", "Other User")
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.s1 = make_session(self.creator, "Session A")
        self.s2 = make_session(self.creator, "Session B")
        self.s3 = make_session(self.creator, "Session C")
        Booking.objects.create(user=self.user, session=self.s1, status=Booking.Status.PENDING)
        Booking.objects.create(user=self.user, session=self.s2, status=Booking.Status.CONFIRMED)
        Booking.objects.create(user=self.user, session=self.s3, status=Booking.Status.CANCELLED)
        # Other user's booking — should not appear
        Booking.objects.create(user=self.other_user, session=self.s1)

    def test_returns_only_own_bookings(self):
        res = self.client.get("/api/bookings/my/", **auth_header(self.user))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 3)

    def test_filter_by_status_pending(self):
        res = self.client.get("/api/bookings/my/?status=PENDING", **auth_header(self.user))
        self.assertEqual(res.data["count"], 1)
        self.assertEqual(res.data["results"][0]["status"], "PENDING")

    def test_filter_by_status_confirmed(self):
        res = self.client.get("/api/bookings/my/?status=CONFIRMED", **auth_header(self.user))
        self.assertEqual(res.data["count"], 1)

    def test_filter_by_status_cancelled(self):
        res = self.client.get("/api/bookings/my/?status=CANCELLED", **auth_header(self.user))
        self.assertEqual(res.data["count"], 1)

    def test_pagination_works(self):
        res = self.client.get("/api/bookings/my/?page_size=2", **auth_header(self.user))
        self.assertEqual(len(res.data["results"]), 2)
        self.assertEqual(res.data["count"], 3)
        self.assertEqual(res.data["total_pages"], 2)

    def test_unauthenticated_denied(self):
        res = self.client.get("/api/bookings/my/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class BookingCancelTest(APITestCase):
    def setUp(self):
        self.user = make_user("user@example.com", "User")
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.session = make_session(self.creator)
        self.booking = Booking.objects.create(
            user=self.user, session=self.session, status=Booking.Status.PENDING
        )

    def test_user_can_cancel_pending_booking(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/cancel/",
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CANCELLED)

    def test_cannot_cancel_already_cancelled(self):
        self.booking.status = Booking.Status.CANCELLED
        self.booking.save()
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/cancel/",
            format="json",
            **auth_header(self.user),
        )
        # get_queryset filters PENDING only, so 404
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_cancel_confirmed_booking(self):
        self.booking.status = Booking.Status.CONFIRMED
        self.booking.save()
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/cancel/",
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_other_user_cannot_cancel_booking(self):
        other = make_user("other@example.com", "Other")
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/cancel/",
            format="json",
            **auth_header(other),
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class CreatorBookingsTest(APITestCase):
    def setUp(self):
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.other_creator = make_user("other@example.com", "Other Creator", User.Role.CREATOR)
        self.user1 = make_user("user1@example.com", "User 1")
        self.user2 = make_user("user2@example.com", "User 2")
        self.s1 = make_session(self.creator, "Session A")
        self.s2 = make_session(self.creator, "Session B")
        self.s_other = make_session(self.other_creator, "Other Session")
        Booking.objects.create(user=self.user1, session=self.s1, status=Booking.Status.PENDING)
        Booking.objects.create(user=self.user2, session=self.s1, status=Booking.Status.CONFIRMED)
        Booking.objects.create(user=self.user1, session=self.s2, status=Booking.Status.CANCELLED)
        # Should not appear for self.creator
        Booking.objects.create(user=self.user2, session=self.s_other)

    def test_creator_sees_own_session_bookings_only(self):
        res = self.client.get("/api/bookings/creator/", **auth_header(self.creator))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 3)

    def test_filter_by_status(self):
        res = self.client.get(
            "/api/bookings/creator/?status=PENDING", **auth_header(self.creator)
        )
        self.assertEqual(res.data["count"], 1)

    def test_filter_by_session(self):
        res = self.client.get(
            f"/api/bookings/creator/?session={self.s1.id}", **auth_header(self.creator)
        )
        self.assertEqual(res.data["count"], 2)

    def test_user_cannot_access_creator_view(self):
        res = self.client.get("/api/bookings/creator/", **auth_header(self.user1))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class BookingStatusUpdateTest(APITestCase):
    def setUp(self):
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.other_creator = make_user("other@example.com", "Other Creator", User.Role.CREATOR)
        self.user = make_user("user@example.com", "User")
        self.session = make_session(self.creator)
        self.booking = Booking.objects.create(
            user=self.user, session=self.session, status=Booking.Status.PENDING
        )

    def test_creator_can_confirm_booking(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CONFIRMED)

    def test_creator_can_cancel_booking(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/status/",
            {"status": "CANCELLED"},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CANCELLED)

    def test_cannot_set_same_status(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/status/",
            {"status": "PENDING"},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_creator_blocked(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
            **auth_header(self.other_creator),
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_blocked(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/status/",
            {"status": "CONFIRMED"},
            format="json",
            **auth_header(self.user),
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_status_value_rejected(self):
        res = self.client.patch(
            f"/api/bookings/{self.booking.id}/status/",
            {"status": "APPROVED"},
            format="json",
            **auth_header(self.creator),
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class BookingStatsTest(APITestCase):
    def setUp(self):
        self.creator = make_user("creator@example.com", "Creator", User.Role.CREATOR)
        self.user = make_user("user@example.com", "User")
        session = make_session(self.creator)
        s2 = make_session(self.creator, "Session 2")
        s3 = make_session(self.creator, "Session 3")
        Booking.objects.create(user=self.user, session=session, status=Booking.Status.CONFIRMED)
        Booking.objects.create(user=self.user, session=s2, status=Booking.Status.PENDING)
        Booking.objects.create(user=self.user, session=s3, status=Booking.Status.CANCELLED)

    def test_stats_returns_correct_counts(self):
        res = self.client.get("/api/bookings/creator/stats/", **auth_header(self.creator))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total"], 3)
        self.assertEqual(res.data["confirmed"], 1)
        self.assertEqual(res.data["pending"], 1)
        self.assertEqual(res.data["cancelled"], 1)

    def test_user_cannot_access_stats(self):
        res = self.client.get("/api/bookings/creator/stats/", **auth_header(self.user))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
