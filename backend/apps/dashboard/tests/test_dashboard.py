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


def make_session(creator, title="Session", price="50.00", duration=60):
    return Session.objects.create(
        creator=creator,
        title=title,
        description="Desc",
        price=Decimal(price),
        duration=duration,
    )


class UserDashboardTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com", name="Test User", role=User.Role.USER
        )
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.s1 = make_session(self.creator, "Session A", "100.00")
        self.s2 = make_session(self.creator, "Session B", "200.00")
        self.s3 = make_session(self.creator, "Session C", "300.00")

        Booking.objects.create(
            user=self.user, session=self.s1, status=Booking.Status.PENDING
        )
        Booking.objects.create(
            user=self.user, session=self.s2, status=Booking.Status.CONFIRMED
        )
        Booking.objects.create(
            user=self.user, session=self.s3, status=Booking.Status.CANCELLED
        )

    def test_user_dashboard_returns_200(self):
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_user_dashboard_contains_all_sections(self):
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        self.assertIn("profile", res.data)
        self.assertIn("stats", res.data)
        self.assertIn("recent_bookings", res.data)
        self.assertIn("upcoming_bookings", res.data)
        self.assertIn("past_bookings", res.data)

    def test_profile_section_correct(self):
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        self.assertEqual(res.data["profile"]["email"], "user@example.com")
        self.assertEqual(res.data["profile"]["role"], "USER")

    def test_stats_counts_correct(self):
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        stats = res.data["stats"]
        self.assertEqual(stats["total"], 3)
        self.assertEqual(stats["pending"], 1)
        self.assertEqual(stats["confirmed"], 1)
        self.assertEqual(stats["cancelled"], 1)

    def test_upcoming_bookings_are_confirmed_only(self):
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        for booking in res.data["upcoming_bookings"]:
            self.assertEqual(booking["status"], "CONFIRMED")

    def test_past_bookings_are_cancelled_only(self):
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        for booking in res.data["past_bookings"]:
            self.assertEqual(booking["status"], "CANCELLED")

    def test_recent_bookings_limited_to_5(self):
        # Add 4 more sessions and bookings (total 7)
        for i in range(4):
            s = make_session(self.creator, f"Extra {i}")
            Booking.objects.create(user=self.user, session=s)
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        self.assertLessEqual(len(res.data["recent_bookings"]), 5)

    def test_unauthenticated_denied(self):
        res = self.client.get("/api/dashboard/user/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_only_own_bookings_shown(self):
        other_user = User.objects.create_user(
            email="other@example.com", name="Other", role=User.Role.USER
        )
        Booking.objects.create(user=other_user, session=self.s1)
        res = self.client.get("/api/dashboard/user/", **auth_header(self.user))
        # Still 3 — other user's booking not included
        self.assertEqual(res.data["stats"]["total"], 3)


class CreatorDashboardTest(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.other_creator = User.objects.create_user(
            email="other@example.com", name="Other Creator", role=User.Role.CREATOR
        )
        self.user = User.objects.create_user(
            email="user@example.com", name="User", role=User.Role.USER
        )

        self.s1 = make_session(self.creator, "Top Session", "100.00")
        self.s2 = make_session(self.creator, "Mid Session", "200.00")
        self.s3 = make_session(self.creator, "Low Session", "300.00")
        self.s_other = make_session(self.other_creator, "Other Session", "50.00")

        Booking.objects.create(
            user=self.user, session=self.s1, status=Booking.Status.CONFIRMED
        )
        Booking.objects.create(
            user=self.user, session=self.s2, status=Booking.Status.PENDING
        )
        Booking.objects.create(
            user=self.user, session=self.s3, status=Booking.Status.CANCELLED
        )
        # Should NOT appear for self.creator
        Booking.objects.create(user=self.user, session=self.s_other)

    def test_creator_dashboard_returns_200(self):
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_creator_dashboard_contains_all_sections(self):
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        for key in ("profile", "stats", "recent_sessions", "recent_bookings", "top_sessions"):
            self.assertIn(key, res.data)

    def test_stats_correct(self):
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        stats = res.data["stats"]
        self.assertEqual(stats["total_sessions"], 3)
        self.assertEqual(stats["total_bookings"], 3)
        self.assertEqual(stats["confirmed_bookings"], 1)
        self.assertEqual(stats["pending_bookings"], 1)
        self.assertEqual(stats["cancelled_bookings"], 1)

    def test_revenue_counts_only_confirmed(self):
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        # Only s1 (CONFIRMED, price 100) contributes
        self.assertEqual(Decimal(res.data["stats"]["total_revenue"]), Decimal("100.00"))

    def test_recent_sessions_limited_to_5(self):
        for i in range(4):
            make_session(self.creator, f"Extra {i}")
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        self.assertLessEqual(len(res.data["recent_sessions"]), 5)

    def test_top_sessions_ordered_by_bookings(self):
        # Add a second booking to s1 via another user
        user2 = User.objects.create_user(
            email="user2@example.com", name="User2", role=User.Role.USER
        )
        Booking.objects.create(user=user2, session=self.s1, status=Booking.Status.CONFIRMED)
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        top = res.data["top_sessions"]
        self.assertEqual(top[0]["title"], "Top Session")

    def test_other_creator_data_excluded(self):
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.creator))
        # Only 3 bookings for self.creator's sessions, not 4
        self.assertEqual(res.data["stats"]["total_bookings"], 3)

    def test_regular_user_blocked_from_creator_dashboard(self):
        res = self.client.get("/api/dashboard/creator/", **auth_header(self.user))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_blocked(self):
        res = self.client.get("/api/dashboard/creator/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
