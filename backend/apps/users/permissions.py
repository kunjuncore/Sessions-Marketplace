from rest_framework.permissions import BasePermission


class IsUser(BasePermission):
    """Allows access only to authenticated users with role USER."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "USER"
        )


class IsCreator(BasePermission):
    """Allows access only to authenticated users with role CREATOR."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "CREATOR"
        )
