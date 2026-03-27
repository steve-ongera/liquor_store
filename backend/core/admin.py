from django.contrib import admin
from .models import (
    Category, Brand, Product, ProductImage, Review,
    Region, PickupStation, DeliveryZone,
    Cart, CartItem, Order, OrderItem, Wishlist
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'country_of_origin', 'is_active']
    list_filter = ['is_active']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'price', 'stock', 'is_available', 'is_featured', 'is_best_seller']
    list_filter = ['is_available', 'is_featured', 'is_new_arrival', 'is_best_seller', 'category', 'brand']
    search_fields = ['name', 'sku', 'brand__name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    list_editable = ['is_available', 'is_featured', 'stock']
    readonly_fields = ['average_rating', 'total_reviews', 'sku']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'rating', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase']
    search_fields = ['user__username', 'product__name']


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


class PickupStationAdmin(admin.ModelAdmin):
    list_display = ['name', 'region', 'pickup_fee', 'is_active']
    list_filter = ['region', 'is_active']
    search_fields = ['name', 'address']

admin.site.register(PickupStation, PickupStationAdmin)
admin.site.register(DeliveryZone)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_price', 'quantity']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'full_name', 'status', 'delivery_type', 'total_amount', 'payment_status', 'created_at']
    list_filter = ['status', 'delivery_type', 'payment_method', 'payment_status']
    search_fields = ['order_number', 'full_name', 'phone', 'email']
    readonly_fields = ['order_number', 'subtotal', 'delivery_fee', 'total_amount']
    inlines = [OrderItemInline]
    list_editable = ['status']


admin.site.site_header = "Spiritz Admin"
admin.site.site_title = "Spiritz"
admin.site.index_title = "Liquor Store Management"