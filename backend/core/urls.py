from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'regions', views.RegionViewSet, basename='region')
router.register(r'pickup-stations', views.PickupStationViewSet, basename='pickup-station')
router.register(r'delivery-zones', views.DeliveryZoneViewSet, basename='delivery-zone')
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]