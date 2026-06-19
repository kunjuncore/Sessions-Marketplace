from django.urls import path
from .views import (
    BookingCreateView,
    MyBookingsView,
    CreatorBookingsView,
    BookingStatusUpdateView,
)

urlpatterns = [
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("my/", MyBookingsView.as_view(), name="my-bookings"),
    path("creator/", CreatorBookingsView.as_view(), name="creator-bookings"),
    path("<uuid:pk>/status/", BookingStatusUpdateView.as_view(), name="booking-status"),
]
