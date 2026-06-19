from django.urls import path
from .views import UserDashboardView, CreatorDashboardView

urlpatterns = [
    path("user/", UserDashboardView.as_view(), name="user-dashboard"),
    path("creator/", CreatorDashboardView.as_view(), name="creator-dashboard"),
]
