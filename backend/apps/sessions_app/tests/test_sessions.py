from decimal import Decimal
import shutil
import tempfile

from django.core.files.base import ContentFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.sessions_app.models import Session
from apps.bookings.models import Booking


def auth_header(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


def make_session(creator, title="Test Session", price="49.99", duration=60):
    return Session.objects.create(
        creator=creator,
        title=title,
        description="A great session",
        price=Decimal(price),
        duration=duration,
    )


class SessionListTest(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        make_session(self.creator, title="Python Basics", price="29.99", duration=45)
        make_session(self.creator, title="Django Advanced", price="99.99", duration=120)
        make_session(self.creator, title="React Workshop", price="59.99", duration=90)

    def test_list_returns_paginated_results(self):
        response = self.client.get("/api/sessions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        self.assertIn("total_pages", response.data)
        self.assertEqual(response.data["count"], 3)

    def test_search_by_title(self):
        response = self.client.get("/api/sessions/?search=Django")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Django Advanced")

    def test_search_by_creator_name(self):
        response = self.client.get("/api/sessions/?search=Creator")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)

    def test_filter_by_min_price(self):
        response = self.client.get("/api/sessions/?min_price=60")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Django Advanced")

    def test_filter_by_max_price(self):
        response = self.client.get("/api/sessions/?max_price=50")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Python Basics")

    def test_filter_by_price_range(self):
        response = self.client.get("/api/sessions/?min_price=30&max_price=70")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "React Workshop")

    def test_filter_by_duration_range(self):
        response = self.client.get("/api/sessions/?min_duration=80&max_duration=100")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "React Workshop")

    def test_order_by_price_ascending(self):
        response = self.client.get("/api/sessions/?ordering=price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [Decimal(s["price"]) for s in response.data["results"]]
        self.assertEqual(prices, sorted(prices))

    def test_order_by_price_descending(self):
        response = self.client.get("/api/sessions/?ordering=-price")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [Decimal(s["price"]) for s in response.data["results"]]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_page_size_respected(self):
        response = self.client.get("/api/sessions/?page_size=2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)
        self.assertEqual(response.data["count"], 3)
        self.assertEqual(response.data["total_pages"], 2)

    def test_filter_by_creator_uuid(self):
        response = self.client.get(f"/api/sessions/?creator={self.creator.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)


class SessionCRUDTest(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.session = make_session(self.creator)

    def test_retrieve_session(self):
        response = self.client.get(f"/api/sessions/{self.session.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Session")
        self.assertIn("booking_count", response.data)
        self.assertIn("is_booked", response.data)

    def test_retrieve_session_marks_authenticated_user_booking(self):
        user = User.objects.create_user(
            email="user@example.com", name="User", role=User.Role.USER
        )
        Booking.objects.create(user=user, session=self.session)

        response = self.client.get(
            f"/api/sessions/{self.session.id}/", **auth_header(user)
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_booked"])

    def test_create_session(self):
        data = {
            "title": "New Session",
            "description": "Great content",
            "price": "39.99",
            "duration": 60,
        }
        response = self.client.post("/api/sessions/", data, **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Session.objects.count(), 2)

    def test_create_sets_creator_automatically(self):
        data = {
            "title": "Auto Creator",
            "description": "Desc",
            "price": "10.00",
            "duration": 30,
        }
        response = self.client.post("/api/sessions/", data, **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_session = Session.objects.get(title="Auto Creator")
        self.assertEqual(new_session.creator, self.creator)

    def test_partial_update_session(self):
        response = self.client.patch(
            f"/api/sessions/{self.session.id}/",
            {"title": "Updated Title"},
            content_type="application/json",
            **auth_header(self.creator),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.session.refresh_from_db()
        self.assertEqual(self.session.title, "Updated Title")

    def test_full_update_session(self):
        data = {
            "title": "Fully Updated",
            "description": "Updated description",
            "price": "79.99",
            "duration": 75,
        }
        response = self.client.put(
            f"/api/sessions/{self.session.id}/",
            data,
            format="json",
            **auth_header(self.creator),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.session.refresh_from_db()
        self.assertEqual(self.session.title, "Fully Updated")
        self.assertEqual(self.session.description, "Updated description")
        self.assertEqual(self.session.price, Decimal("79.99"))
        self.assertEqual(self.session.duration, 75)

    def test_delete_session(self):
        response = self.client.delete(
            f"/api/sessions/{self.session.id}/", **auth_header(self.creator)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Session.objects.count(), 0)

    def test_negative_price_rejected(self):
        response = self.client.patch(
            f"/api/sessions/{self.session.id}/",
            {"price": "-5.00"},
            content_type="application/json",
            **auth_header(self.creator),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_zero_duration_rejected(self):
        data = {
            "title": "Bad Session",
            "description": "Desc",
            "price": "10.00",
            "duration": 0,
        }
        response = self.client.post("/api/sessions/", data, **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SessionImageTest(APITestCase):
    def setUp(self):
        self.media_root = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.media_root)
        self.override.enable()
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.session = make_session(self.creator)
        self.session.image.save(
            "sessions/test-image.jpg", ContentFile(b"fake image bytes"), save=True
        )

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)
        super().tearDown()

    def test_creator_can_remove_session_image(self):
        response = self.client.delete(
            f"/api/sessions/{self.session.id}/image/",
            **auth_header(self.creator),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.session.refresh_from_db()
        self.assertFalse(self.session.image)

    def test_remove_image_is_idempotent(self):
        self.session.image.delete(save=False)
        self.session.image = None
        self.session.save(update_fields=["image"])

        response = self.client.delete(
            f"/api/sessions/{self.session.id}/image/",
            **auth_header(self.creator),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class MySessionsTest(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.other_creator = User.objects.create_user(
            email="other@example.com", name="Other", role=User.Role.CREATOR
        )
        make_session(self.creator, title="My Session 1")
        make_session(self.creator, title="My Session 2")
        make_session(self.other_creator, title="Not Mine")

    def test_my_sessions_returns_only_own(self):
        response = self.client.get("/api/sessions/my/", **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        titles = [s["title"] for s in response.data["results"]]
        self.assertIn("My Session 1", titles)
        self.assertNotIn("Not Mine", titles)

    def test_user_cannot_access_my_sessions(self):
        user = User.objects.create_user(
            email="user@example.com", name="User", role=User.Role.USER
        )
        response = self.client.get("/api/sessions/my/", **auth_header(user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SessionStatsTest(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            email="creator@example.com", name="Creator", role=User.Role.CREATOR
        )
        self.user = User.objects.create_user(
            email="user@example.com", name="User", role=User.Role.USER
        )
        self.s1 = make_session(self.creator, title="S1", price="100.00")
        self.s2 = make_session(self.creator, title="S2", price="200.00")
        Booking.objects.create(
            user=self.user, session=self.s1, status=Booking.Status.CONFIRMED
        )
        Booking.objects.create(
            user=self.user, session=self.s2, status=Booking.Status.PENDING
        )

    def test_stats_returns_correct_counts(self):
        response = self.client.get("/api/sessions/stats/", **auth_header(self.creator))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_sessions"], 2)
        self.assertEqual(response.data["total_bookings"], 2)
        self.assertEqual(response.data["confirmed_bookings"], 1)
        self.assertEqual(response.data["pending_bookings"], 1)
        self.assertEqual(response.data["cancelled_bookings"], 0)
        self.assertEqual(Decimal(response.data["total_revenue"]), Decimal("100.00"))

    def test_user_cannot_access_stats(self):
        response = self.client.get("/api/sessions/stats/", **auth_header(self.user))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
