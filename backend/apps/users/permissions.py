from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsUser(BasePermission):
    """Authenticated user with role USER."""

    message = "Only users with the USER role can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "USER"
        )


class IsCreator(BasePermission):
    """Authenticated user with role CREATOR."""

    message = "Only users with the CREATOR role can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "CREATOR"
        )


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Read-only access for unauthenticated users.
    Write access requires authentication (any role).
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class IsSessionOwner(BasePermission):
    """
    Object-level permission: only the creator who owns the session
    can modify or delete it.
    """

    message = "You can only modify your own sessions."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # obj is a Session instance
        return obj.creator == request.user


class IsBookingOwner(BasePermission):
    """
    Object-level permission: only the user who made the booking
    can view it.
    """

    message = "You can only access your own bookings."

    def has_object_permission(self, request, view, obj):
        # obj is a Booking instance
        return obj.user == request.user


class IsBookingSessionCreator(BasePermission):
    """
    Object-level permission: only the creator of the booked session
    can update its status.
    """

    message = "You can only manage bookings for your own sessions."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "CREATOR"
        )

    def has_object_permission(self, request, view, obj):
        # obj is a Booking instance
        return obj.session.creator == request.user
