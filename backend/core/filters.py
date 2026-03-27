# core/filters.py
import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    brand = django_filters.CharFilter(field_name='brand__slug')
    category = django_filters.CharFilter(field_name='category__slug')
    volume = django_filters.CharFilter(field_name='volume')
    min_abv = django_filters.NumberFilter(field_name='alcohol_content', lookup_expr='gte')
    max_abv = django_filters.NumberFilter(field_name='alcohol_content', lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name='average_rating', lookup_expr='gte')
    is_featured = django_filters.BooleanFilter()
    is_new_arrival = django_filters.BooleanFilter()
    is_best_seller = django_filters.BooleanFilter()
    on_sale = django_filters.BooleanFilter(field_name='discount_percentage', method='filter_on_sale')

    def filter_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(discount_percentage__gt=0)
        return queryset

    class Meta:
        model = Product
        fields = ['min_price', 'max_price', 'brand', 'category', 'volume',
                  'min_abv', 'max_abv', 'min_rating', 'is_featured',
                  'is_new_arrival', 'is_best_seller']