from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Bootstrap icon class e.g. bi-cup-straw")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    country_of_origin = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    VOLUME_CHOICES = [
        ('200ml', '200ml'),
        ('350ml', '350ml'),
        ('500ml', '500ml'),
        ('750ml', '750ml'),
        ('1L', '1 Litre'),
        ('1.5L', '1.5 Litres'),
        ('2L', '2 Litres'),
        ('3L', '3 Litres'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, max_length=300)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name='products')
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.PositiveIntegerField(default=0)

    # Details
    volume = models.CharField(max_length=10, choices=VOLUME_CHOICES, default='750ml')
    alcohol_content = models.DecimalField(max_digits=5, decimal_places=2, help_text="ABV %", null=True, blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, unique=True, blank=True)

    # Stock
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=300, blank=True)

    # Images
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)

    # Ratings (cached)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.brand} {self.name} {self.volume}")
            self.slug = base_slug
        if not self.sku:
            self.sku = f"LQ-{str(self.id)[:8].upper()}"
        if self.old_price and self.old_price > self.price:
            self.discount_percentage = int(((self.old_price - self.price) / self.old_price) * 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.volume})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/images/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'user']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update product cached ratings
        product = self.product
        reviews = Review.objects.filter(product=product)
        product.total_reviews = reviews.count()
        product.average_rating = reviews.aggregate(
            avg=models.Avg('rating')
        )['avg'] or 0
        product.save(update_fields=['average_rating', 'total_reviews'])

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}★)"


# ─── Delivery / Pickup ───────────────────────────────────────────────────────

class Region(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PickupStation(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='pickup_stations')
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    opening_hours = models.CharField(max_length=200, blank=True, default="Mon-Sat 8am-6pm")
    pickup_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.region.name}"


class DeliveryZone(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='delivery_zones')
    name = models.CharField(max_length=200)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2)
    estimated_days = models.CharField(max_length=50, default="1-3 days")

    def __str__(self):
        return f"{self.name} - KES {self.delivery_fee}"


# ─── Cart & Orders ────────────────────────────────────────────────────────────

class Cart(models.Model):
    session_key = models.CharField(max_length=40, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())

    def get_item_count(self):
        return sum(item.quantity for item in self.items.all())

    def __str__(self):
        return f"Cart {self.id}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def get_subtotal(self):
        return self.product.price * self.quantity

    class Meta:
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    DELIVERY_TYPE_CHOICES = [
        ('pickup', 'Pickup Station'),
        ('home', 'Home Delivery'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('card', 'Credit/Debit Card'),
        ('cash', 'Cash on Delivery'),
    ]

    order_number = models.CharField(max_length=20, unique=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    session_key = models.CharField(max_length=40, blank=True, null=True)

    # Delivery info
    delivery_type = models.CharField(max_length=10, choices=DELIVERY_TYPE_CHOICES)
    pickup_station = models.ForeignKey(PickupStation, on_delete=models.SET_NULL, null=True, blank=True)
    delivery_address = models.TextField(blank=True)
    delivery_zone = models.ForeignKey(DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True)

    # Contact
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    # Financials
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='mpesa')
    payment_status = models.CharField(max_length=20, default='unpaid')
    mpesa_transaction_id = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"LQ{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)  # snapshot
    product_price = models.DecimalField(max_digits=10, decimal_places=2)  # snapshot
    quantity = models.PositiveIntegerField()

    def get_subtotal(self):
        return self.product_price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']