from django.urls import path
from .views import (
    BookingCreateView,
    BookingDetailView,
    BookingCancelView,
    MyBookingsView,
    CreatorBookingsView,
    BookingStatusUpdateView,
    BookingStatsView,
)

urlpatterns = [
    # User endpoints
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("my/", MyBookingsView.as_view(), name="my-bookings"),
    path("<uuid:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path("<uuid:pk>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),

    # Creator endpoints
    path("creator/", CreatorBookingsView.as_view(), name="creator-bookings"),
    path("creator/stats/", BookingStatsView.as_view(), name="booking-stats"),
    path("<uuid:pk>/status/", BookingStatusUpdateView.as_view(), name="booking-status"),
]
