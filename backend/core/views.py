from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404

from .models import (
    Category, Brand, Product, Review,
    Region, PickupStation, DeliveryZone,
    Cart, CartItem, Order, OrderItem, Wishlist
)
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer,
    ReviewSerializer, ReviewCreateSerializer,
    RegionSerializer, PickupStationSerializer, DeliveryZoneSerializer,
    CartSerializer, CartItemSerializer,
    OrderSerializer, OrderCreateSerializer,
)
from .filters import ProductFilter
from .pagination import StandardResultsPagination


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True).select_related('category', 'brand').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand__name', 'category__name']
    ordering_fields = ['price', 'average_rating', 'created_at', 'total_reviews', 'discount_percentage']
    ordering = ['-created_at']
    pagination_class = StandardResultsPagination
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)[:12]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        qs = self.get_queryset().filter(is_new_arrival=True)[:12]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        qs = self.get_queryset().filter(is_best_seller=True)[:12]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def deals(self, request):
        qs = self.get_queryset().filter(discount_percentage__gte=10).order_by('-discount_percentage')[:12]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def reviews(self, request, slug=None):
        product = self.get_object()
        if request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
            serializer = ReviewCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(product=product, user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        reviews = product.reviews.all()
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        slug = request.query_params.get('slug')
        if not slug:
            return Response({'detail': 'slug param required'}, status=400)
        category = get_object_or_404(Category, slug=slug)
        qs = self.filter_queryset(self.get_queryset().filter(category=category))
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


# ─── Delivery ─────────────────────────────────────────────────────────────────

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def pickup_stations(self, request, slug=None):
        region = self.get_object()
        stations = PickupStation.objects.filter(region=region, is_active=True)
        serializer = PickupStationSerializer(stations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def delivery_zones(self, request, slug=None):
        region = self.get_object()
        zones = DeliveryZone.objects.filter(region=region)
        serializer = DeliveryZoneSerializer(zones, many=True)
        return Response(serializer.data)


class PickupStationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PickupStation.objects.filter(is_active=True)
    serializer_class = PickupStationSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['region']
    permission_classes = [AllowAny]


class DeliveryZoneViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeliveryZone.objects.all()
    serializer_class = DeliveryZoneSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['region']
    permission_classes = [AllowAny]


# ─── Cart ─────────────────────────────────────────────────────────────────────

def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key or request.session.create() or request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart


class CartViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        cart = get_or_create_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        try:
            product = Product.objects.get(id=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=404)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart = get_or_create_cart(request)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found.'}, status=404)
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = get_or_create_cart(request)
        item_id = request.data.get('item_id')
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = get_or_create_cart(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


# ─── Orders ──────────────────────────────────────────────────────────────────

class OrderViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def create(self, request):
        cart = get_or_create_cart(request)
        if not cart.items.exists():
            return Response({'detail': 'Cart is empty.'}, status=400)

        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        delivery_type = data.get('delivery_type')

        # Calculate delivery fee
        delivery_fee = 0
        if delivery_type == 'pickup' and data.get('pickup_station'):
            delivery_fee = data['pickup_station'].pickup_fee
        elif delivery_type == 'home' and data.get('delivery_zone'):
            delivery_fee = data['delivery_zone'].delivery_fee

        subtotal = cart.get_total()
        total = subtotal + delivery_fee

        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_key=request.session.session_key,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total,
            **data
        )

        # Create order items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
            )

        # Clear cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=201)

    def retrieve(self, request, pk=None):
        try:
            order = Order.objects.get(order_number=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=404)
        return Response(OrderSerializer(order).data)