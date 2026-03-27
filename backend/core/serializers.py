from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Brand, Product, ProductImage, Review,
    Region, PickupStation, DeliveryZone,
    Cart, CartItem, Order, OrderItem, Wishlist
)


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'icon', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_available=True).count()


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'country_of_origin', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_available=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    brand_slug = serializers.CharField(source='brand.slug', read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category_name', 'brand_name', 'brand_slug',
            'price', 'old_price', 'discount_percentage', 'volume',
            'alcohol_content', 'thumbnail_url', 'average_rating',
            'total_reviews', 'is_featured', 'is_new_arrival', 'is_best_seller',
            'stock', 'is_available',
        ]

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail:
            url = obj.thumbnail.url
            return request.build_absolute_uri(url) if request else url
        # Try first image
        first_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if first_img:
            url = first_img.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail page."""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()
    recently_reviewed = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'brand', 'description',
            'short_description', 'price', 'old_price', 'discount_percentage',
            'volume', 'alcohol_content', 'country_of_origin', 'sku',
            'stock', 'is_available', 'is_featured', 'is_new_arrival',
            'is_best_seller', 'average_rating', 'total_reviews',
            'meta_title', 'meta_description', 'images', 'reviews',
            'related_products', 'recently_reviewed', 'created_at',
        ]

    def get_reviews(self, obj):
        reviews = obj.reviews.all()[:10]
        return ReviewSerializer(reviews, many=True, context=self.context).data

    def get_related_products(self, obj):
        related = Product.objects.filter(
            category=obj.category, is_available=True
        ).exclude(id=obj.id)[:8]
        return ProductListSerializer(related, many=True, context=self.context).data

    def get_recently_reviewed(self, obj):
        # Products with recent reviews in same category
        from django.db.models import Max
        recent = Product.objects.filter(
            category=obj.category,
            is_available=True,
            total_reviews__gt=0
        ).exclude(id=obj.id).order_by('-updated_at')[:6]
        return ProductListSerializer(recent, many=True, context=self.context).data


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'username', 'full_name', 'rating', 'title', 'body',
            'is_verified_purchase', 'helpful_count', 'created_at'
        ]
        read_only_fields = ['is_verified_purchase', 'helpful_count', 'created_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'body']


# ─── Delivery ────────────────────────────────────────────────────────────────

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name', 'slug']


class PickupStationSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = PickupStation
        fields = [
            'id', 'name', 'slug', 'region_name', 'address',
            'latitude', 'longitude', 'phone', 'opening_hours',
            'pickup_fee', 'is_active'
        ]


class DeliveryZoneSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = DeliveryZone
        fields = ['id', 'region_name', 'name', 'delivery_fee', 'estimated_days']


# ─── Cart ─────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']

    def get_subtotal(self, obj):
        return float(obj.get_subtotal())


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'created_at']

    def get_total(self, obj):
        return float(obj.get_total())

    def get_item_count(self, obj):
        return obj.get_item_count()


# ─── Orders ──────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return float(obj.get_subtotal())


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'delivery_type', 'pickup_station', 'delivery_address',
            'delivery_zone', 'full_name', 'email', 'phone',
            'payment_method', 'notes'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    pickup_station = PickupStationSerializer(read_only=True)
    delivery_zone = DeliveryZoneSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'delivery_type', 'pickup_station',
            'delivery_address', 'delivery_zone', 'full_name', 'email',
            'phone', 'subtotal', 'delivery_fee', 'total_amount',
            'payment_method', 'payment_status', 'status', 'notes',
            'items', 'created_at'
        ]