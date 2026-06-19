import django_filters
from .models import Session


class SessionFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_duration = django_filters.NumberFilter(field_name="duration", lookup_expr="gte")
    max_duration = django_filters.NumberFilter(field_name="duration", lookup_expr="lte")
    creator = django_filters.UUIDFilter(field_name="creator__id")
    # Convenience: filter by creator email (useful in admin / debug)
    creator_email = django_filters.CharFilter(
        field_name="creator__email", lookup_expr="iexact"
    )

    class Meta:
        model = Session
        fields = [
            "min_price",
            "max_price",
            "min_duration",
            "max_duration",
            "creator",
            "creator_email",
        ]
