from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import GoogleAuthView, LogoutView, MeView, RoleUpdateView

urlpatterns = [
    path("google/", GoogleAuthView.as_view(), name="google-auth"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("role/", RoleUpdateView.as_view(), name="role-update"),
]
