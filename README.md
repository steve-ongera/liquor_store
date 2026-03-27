# 🥃 Spiritz — Kenya's Premier Online Liquor Store

> A full-stack e-commerce platform built with **Django REST Framework** + **React 18 + Vite**.
> Jumia-inspired UI structure with a premium dark amber liquor theme.

---

## 📁 Full Project Structure

```
spiritz/
│
├── backend/                                  ← Django REST API
│   │
│   ├── core/                     ← Single Django app
│   │   ├── __init__.py
│   │   ├── admin.py                          ← Admin panel registrations + inlines
│   │   ├── apps.py
│   │   ├── filters.py                        ← ProductFilter (django-filter)
│   │   │                                        price, brand, category, volume,
│   │   │                                        ABV, rating, sale, featured, new
│   │   ├── models.py                         ← All database models
│   │   │   ├── Category                      ← Whisky, Vodka, Wine, Beer…
│   │   │   ├── Brand                         ← Johnnie Walker, Jameson…
│   │   │   ├── Product                       ← Price, stock, ABV, volume, SEO slug
│   │   │   ├── ProductImage                  ← Multiple images per product
│   │   │   ├── Review                        ← Star rating + text, auto-avg update
│   │   │   ├── Region                        ← Counties: Nairobi, Mombasa…
│   │   │   ├── PickupStation                 ← lat/lng, fee, opening hours
│   │   │   ├── DeliveryZone                  ← Home delivery zones + pricing
│   │   │   ├── Cart / CartItem               ← Session-based (guests + users)
│   │   │   ├── Order / OrderItem             ← Full order lifecycle + snapshot
│   │   │   └── Wishlist                      ← User saved products
│   │   ├── pagination.py                     ← StandardResultsPagination
│   │   │                                        returns count, total_pages, current_page
│   │   ├── serializers.py                    ← DRF serializers
│   │   │   ├── CategorySerializer
│   │   │   ├── BrandSerializer
│   │   │   ├── ProductListSerializer         ← Lightweight (listing pages)
│   │   │   ├── ProductDetailSerializer       ← Full + reviews + related + recently reviewed
│   │   │   ├── ReviewSerializer / CreateSerializer
│   │   │   ├── RegionSerializer
│   │   │   ├── PickupStationSerializer
│   │   │   ├── DeliveryZoneSerializer
│   │   │   ├── CartSerializer / CartItemSerializer
│   │   │   └── OrderSerializer / OrderCreateSerializer
│   │   ├── urls.py                           ← DRF DefaultRouter (all routes)
│   │   └── views.py                          ← ViewSets
│   │       ├── CategoryViewSet               ← ReadOnly, slug lookup
│   │       ├── BrandViewSet                  ← ReadOnly, slug lookup
│   │       ├── ProductViewSet                ← featured, new_arrivals, best_sellers,
│   │       │                                    deals, by_category, reviews actions
│   │       ├── RegionViewSet                 ← pickup_stations + delivery_zones actions
│   │       ├── PickupStationViewSet
│   │       ├── DeliveryZoneViewSet
│   │       ├── CartViewSet                   ← add, update_item, remove_item, clear
│   │       └── OrderViewSet                  ← create + retrieve by order_number
│   │
│   ├── liquorstore/                          ← Django project config
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py                       ← DRF, CORS, sessions, media, timezone
│   │   ├── urls.py                           ← /api/v1/ + /admin/ + /media/
│   │   └── wsgi.py
│   │
│   ├── manage.py
│   └── requirements.txt                      ← Django, DRF, django-filter,
│                                                django-cors-headers, Pillow
│
└── frontend/                                 ← React 18 + Vite
    │
    ├── index.html                            ← Bootstrap Icons CDN + Google Fonts
    ├── vite.config.js                        ← Dev server on :3000, proxy /api → :8000
    ├── package.json
    │
    └── src/
        │
        ├── main.jsx                          ← ReactDOM.createRoot entry
        │
        ├── App.jsx                           ← BrowserRouter + all providers + routes
        │   └── Routes:
        │       /                 → IndexPage
        │       /store            → StorePage
        │       /category/:slug   → CategoryListPage
        │       /product/:slug    → ProductDetailPage
        │       /cart             → CartPage
        │       /checkout         → CheckoutPage
        │
        ├── api/
        │   └── index.js                      ← All fetch calls to Django API
        │       ├── getCategories / getCategory
        │       ├── getBrands
        │       ├── getProducts / getProduct
        │       ├── getFeatured / getNewArrivals / getBestSellers / getDeals
        │       ├── getProductsByCategory
        │       ├── addReview
        │       ├── getRegions / getPickupStations / getDeliveryZones
        │       ├── getCart / addToCart / updateCartItem / removeCartItem / clearCart
        │       └── createOrder / getOrder
        │
        ├── context/
        │   ├── CartContext.jsx               ← Global cart state, add/update/remove
        │   └── ToastContext.jsx              ← Slide-in toast notifications
        │
        ├── styles/
        │   └── main.css                      ← ~700 lines custom CSS
        │       ├── CSS variables (brand colors, layout, shadows)
        │       ├── Header (topbar, main bar, subnav)
        │       ├── Hero / Side banners
        │       ├── Section headers (Jumia style)
        │       ├── Product card (exact Jumia structure)
        │       │   ├── Image wrap + badges (discount, new, hot)
        │       │   ├── Wishlist hover button
        │       │   ├── Name, volume badge, star rating
        │       │   ├── Price (current, old, discount %)
        │       │   └── Express delivery badge
        │       ├── Horizontal scroll product rows
        │       ├── Category icon strip
        │       ├── Store layout (sidebar + listing area)
        │       ├── Filter sidebar + filter pills
        │       ├── Listing toolbar (result count + sort)
        │       ├── Pagination
        │       ├── Product detail (gallery, specs, CTA, delivery box)
        │       ├── Reviews (summary, rating bars, review cards)
        │       ├── Cart (items, summary, checkout button)
        │       ├── Checkout (steps, delivery toggle, pickup cards,
        │       │            map modal, payment methods, form fields)
        │       ├── Footer
        │       ├── Loading skeletons + shimmer animation
        │       ├── Toast notifications
        │       ├── Age gate modal
        │       └── Full responsive breakpoints (1024px, 768px, 480px)
        │
        ├── components/
        │   ├── Header.jsx                    ← Sticky; topbar, search bar,
        │   │                                    account/wishlist/cart actions,
        │   │                                    animated cart badge, subnav categories
        │   ├── Footer.jsx                    ← 4-column grid; brand, categories,
        │   │                                    customer care, info + app download
        │   ├── ProductCard.jsx               ← Jumia-identical card structure
        │   │   ├── Discount / New / Hot badges
        │   │   ├── Wishlist hover button
        │   │   ├── Image with zoom-on-hover
        │   │   ├── StarRating component (exported)
        │   │   ├── Volume badge
        │   │   ├── Price row (current, old, % off)
        │   │   └── Express Delivery badge
        │   ├── Pagination.jsx                ← Smart ellipsis pagination
        │   │                                    prev / numbered / dots / next
        │   └── AgeGate.jsx                   ← 18+ fullscreen overlay
        │                                        Yes/No — sessionStorage persisted
        │
        └── pages/
            │
            ├── IndexPage.jsx                 ← Homepage
            │   ├── Hero banner (gradient + bottle icon bg)
            │   ├── Side banners (New Arrivals, Top Rated)
            │   ├── Scrollable category icon strip (10 categories)
            │   ├── Flash Deals row
            │   ├── Promo banners (Free Delivery / Genuine / Returns)
            │   ├── Featured Products row
            │   ├── Best Sellers row
            │   ├── New Arrivals row
            │   └── Top Brands chip strip
            │
            ├── StorePage.jsx                 ← Full store listing
            │   ├── Sidebar FilterSidebar component:
            │   │   ├── Price range (min/max + Apply)
            │   │   ├── Category checkboxes (from API)
            │   │   ├── Brand checkboxes (from API, w/ product count)
            │   │   ├── Volume checkboxes
            │   │   ├── Special filters (on sale, new, best seller, featured)
            │   │   └── Min rating radio (4★, 3★, 2★ & up)
            │   ├── Active filter pills (removable per filter)
            │   ├── Toolbar (result count + sort dropdown)
            │   ├── Loading skeleton grid
            │   ├── Paginated product grid (24 per page)
            │   └── URL-synced filters (shareable/bookmarkable)
            │
            ├── CategoryListPage.jsx          ← Per-category listing
            │   ├── Category hero banner (name, description, product count)
            │   ├── Brand + on-sale filters
            │   ├── Sort control
            │   ├── Active brand pills
            │   ├── Paginated grid (by_category endpoint)
            │   └── Breadcrumb (Home → Store → Category)
            │
            ├── ProductDetailPage.jsx         ← Product detail
            │   ├── Breadcrumb
            │   ├── Thumbnail gallery (thumbs strip + main view)
            │   ├── Brand label + product name
            │   ├── Star rating score badge
            │   ├── Price row (current + old + discount badge + savings)
            │   ├── Stock status (In Stock / Only N left / Out of Stock)
            │   ├── Mini specs table (Volume, ABV, Origin, Category, SKU)
            │   ├── Quantity control (+/-)
            │   ├── Add to Cart + Buy Now + Wishlist buttons
            │   ├── Delivery info box (Pickup / Home / Returns / Genuine)
            │   ├── Social share buttons (WhatsApp, Facebook, X, Link)
            │   ├── Product description
            │   ├── Reviews section:
            │   │   ├── Overall score + star distribution bars
            │   │   ├── Write review form (star picker + title + body)
            │   │   └── Review cards (avatar, verified badge, helpful count)
            │   ├── Related Products (horizontal scroll)
            │   └── Recently Reviewed (horizontal scroll)
            │
            ├── CartPage.jsx                  ← Shopping cart
            │   ├── Empty cart state
            │   ├── Item rows (image, name, brand+volume, qty control, remove)
            │   ├── Sticky order summary sidebar
            │   │   ├── Subtotal + discount savings + delivery
            │   │   └── Total
            │   ├── Checkout CTA button
            │   ├── Payment icons (M-Pesa, Visa, MC, Cash)
            │   └── Free delivery progress (KES 3,000 threshold)
            │
            └── CheckoutPage.jsx              ← 3-step checkout
                ├── Step progress bar (Delivery → Contact → Payment)
                │
                ├── Step 1 — Delivery Method:
                │   ├── Toggle: Pickup Station / Home Delivery
                │   ├── Region / County selector
                │   │
                │   ├── [Pickup mode]
                │   │   ├── Pickup station cards (name, address, fee, hours)
                │   │   └── "View on Map" → MapModal
                │   │       ├── Map frame (Google Maps / Leaflet placeholder)
                │   │       ├── Station pin chips (click to select)
                │   │       └── Full station list with fee + hours
                │   │
                │   └── [Home Delivery mode]
                │       └── Delivery zone cards (zone name, price, est. days)
                │           e.g. Mombasa Island KES 200 / Shanzu KES 350
                │
                ├── Step 2 — Contact Info:
                │   ├── Full name + phone (grid row)
                │   ├── Email address
                │   ├── Delivery address (home delivery only)
                │   └── Order notes (optional)
                │
                ├── Step 3 — Payment:
                │   ├── M-Pesa (Paybill + STK push instructions)
                │   ├── Credit / Debit Card
                │   ├── Cash on Delivery
                │   └── Place Order button (KES total)
                │
                ├── Sticky order summary sidebar:
                │   ├── All cart items (thumbnail, name, qty × price)
                │   ├── Subtotal + delivery fee (named station/zone)
                │   ├── Total
                │   └── Selected delivery point card
                │
                └── Order Confirmation screen:
                    ├── Success checkmark animation
                    ├── Order number (e.g. LQAB12CD34)
                    ├── Delivery method summary
                    └── Back to Home / Continue Shopping
```

---

## 🚀 Quick Start

### 1 — Backend (Django)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the app package files if not present
touch core/__init__.py
touch liquorstore/__init__.py

# Run migrations
python manage.py makemigrations core
python manage.py migrate

# Create superuser for admin
python manage.py createsuperuser

# Seed sample data (optional — see section below)
python manage.py shell < seed.py

# Start server
python manage.py runserver
```

| URL | Description |
|-----|-------------|
| `http://localhost:8000/api/v1/` | REST API root |
| `http://localhost:8000/admin/` | Django admin panel |
| `http://localhost:8000/media/` | Uploaded images |

---

### 2 — Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | React app |
| `http://localhost:3000/store` | Store listing |
| `http://localhost:3000/cart` | Shopping cart |
| `http://localhost:3000/checkout` | Checkout |

---

## 📡 API Endpoints

### Products & Catalogue

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/categories/` | All categories |
| `GET` | `/api/v1/categories/{slug}/` | Single category |
| `GET` | `/api/v1/brands/` | All brands |
| `GET` | `/api/v1/products/` | Products (filterable, paginated) |
| `GET` | `/api/v1/products/{slug}/` | Full product detail + reviews + related |
| `GET` | `/api/v1/products/featured/` | Featured products (12) |
| `GET` | `/api/v1/products/new_arrivals/` | New arrivals (12) |
| `GET` | `/api/v1/products/best_sellers/` | Best sellers (12) |
| `GET` | `/api/v1/products/deals/` | On-sale products (12) |
| `GET` | `/api/v1/products/by_category/?slug=whisky` | Category products (paginated) |
| `POST` | `/api/v1/products/{slug}/reviews/` | Submit review |

### Delivery

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/regions/` | All regions / counties |
| `GET` | `/api/v1/regions/{slug}/pickup_stations/` | Stations in a region |
| `GET` | `/api/v1/regions/{slug}/delivery_zones/` | Home delivery zones in a region |
| `GET` | `/api/v1/pickup-stations/` | All pickup stations |
| `GET` | `/api/v1/pickup-stations/?region={id}` | Filter by region |
| `GET` | `/api/v1/delivery-zones/` | All delivery zones |
| `GET` | `/api/v1/delivery-zones/?region={id}` | Filter by region |

### Cart

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/cart/` | — | Get current cart |
| `POST` | `/api/v1/cart/add/` | `{product_id, quantity}` | Add item |
| `POST` | `/api/v1/cart/update_item/` | `{item_id, quantity}` | Update qty |
| `POST` | `/api/v1/cart/remove_item/` | `{item_id}` | Remove item |
| `POST` | `/api/v1/cart/clear/` | — | Empty cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/orders/` | Create order from current cart |
| `GET` | `/api/v1/orders/{order_number}/` | Get order by order number |

### Product Filters Reference

```
GET /api/v1/products/
  ?search=single malt
  &category=whisky
  &brand=johnnie-walker
  &volume=750ml
  &min_price=500
  &max_price=5000
  &min_rating=4
  &min_abv=40
  &max_abv=60
  &on_sale=true
  &is_new_arrival=true
  &is_best_seller=true
  &is_featured=true
  &ordering=-price          # price, -price, average_rating, -average_rating,
                            # created_at, -created_at, total_reviews, -discount_percentage
  &page=2
  &page_size=24
```

---

## 🗄️ Database Models

### Catalogue

| Model | Key Fields |
|-------|-----------|
| `Category` | `name`, `slug`, `icon`, `description`, `image`, `is_active` |
| `Brand` | `name`, `slug`, `logo`, `country_of_origin`, `is_active` |
| `Product` | `name`, `slug` (SEO), `brand`, `category`, `price`, `old_price`, `discount_percentage`, `volume`, `alcohol_content`, `stock`, `is_featured`, `is_new_arrival`, `is_best_seller`, `average_rating`, `total_reviews`, `meta_title`, `meta_description` |
| `ProductImage` | `product`, `image`, `alt_text`, `is_primary`, `order` |
| `Review` | `product`, `user`, `rating (1–5)`, `title`, `body`, `is_verified_purchase`, `helpful_count` |

### Delivery

| Model | Key Fields |
|-------|-----------|
| `Region` | `name`, `slug` |
| `PickupStation` | `name`, `slug`, `region`, `address`, `latitude`, `longitude`, `pickup_fee`, `opening_hours`, `phone` |
| `DeliveryZone` | `region`, `name`, `delivery_fee`, `estimated_days` |

### Commerce

| Model | Key Fields |
|-------|-----------|
| `Cart` | `user` (nullable), `session_key` (guest carts) |
| `CartItem` | `cart`, `product`, `quantity` |
| `Order` | `order_number` (auto), `delivery_type`, `pickup_station` / `delivery_zone`, `full_name`, `email`, `phone`, `subtotal`, `delivery_fee`, `total_amount`, `payment_method`, `status` |
| `OrderItem` | `order`, `product`, `product_name` (snapshot), `product_price` (snapshot), `quantity` |
| `Wishlist` | `user`, `product` |

---

## 🌱 Seed Sample Data

Run in Django shell (`python manage.py shell`):

```python
from core.models import Category, Brand, Product, Region, PickupStation, DeliveryZone
from decimal import Decimal

# ── Categories ──────────────────────────────────────────────
cats = [
    ('Whisky',      'bi-cup-hot',        'Single malts, blends & bourbon'),
    ('Vodka',       'bi-droplet-fill',   'Premium & flavoured vodkas'),
    ('Wine',        'bi-cup-straw',      'Red, white, rosé & sparkling'),
    ('Gin',         'bi-flower1',        'London dry, flavoured & craft gins'),
    ('Beer & Cider','bi-cup',            'Lagers, ales, stouts & ciders'),
    ('Rum',         'bi-brightness-high','White, dark & spiced rums'),
    ('Brandy',      'bi-fire',           'Cognac, Armagnac & local brandy'),
    ('Tequila',     'bi-moon-stars',     'Blanco, reposado & añejo'),
    ('Champagne',   'bi-stars',          'Champagne & sparkling wine'),
    ('Liqueurs',    'bi-gem',            'Cream, fruit & herbal liqueurs'),
]
for name, icon, desc in cats:
    Category.objects.get_or_create(name=name, defaults={'icon': icon, 'description': desc})

# ── Brands ──────────────────────────────────────────────────
brands = [
    ("Johnnie Walker", "Scotland"), ("Jameson", "Ireland"),
    ("Smirnoff", "Russia"),        ("Absolut", "Sweden"),
    ("Jack Daniel's", "USA"),      ("Hennessy", "France"),
    ("Captain Morgan", "Jamaica"), ("Bacardi", "Cuba"),
    ("Gordon's", "UK"),            ("Tanqueray", "UK"),
    ("Olmeca", "Mexico"),          ("Glenfiddich", "Scotland"),
    ("Tusker", "Kenya"),           ("Pilsner Urquell", "Czech Republic"),
    ("Konyagi", "Tanzania"),
]
for name, country in brands:
    Brand.objects.get_or_create(name=name, defaults={'country_of_origin': country})

# ── Regions ──────────────────────────────────────────────────
for region_name in ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
                     'Thika', 'Malindi', 'Nyeri', 'Meru', 'Kakamega']:
    Region.objects.get_or_create(name=region_name)

# ── Pickup Stations (Mombasa) ─────────────────────────────
mombasa = Region.objects.get(name='Mombasa')
stations = [
    ('Mombasa CBD Station',   'Moi Avenue, CBD, Mombasa',               '4.0435',  '39.6682', 0,   'Mon-Sat 8am-7pm'),
    ('Shanzu TTC Station',    'Shanzu Road, near TTC, Shanzu',           '3.9167',  '39.7167', 50,  'Mon-Sat 9am-6pm'),
    ('Nyali Centre Station',  'Links Road, Nyali Centre, Nyali',         '4.0721',  '39.7184', 100, 'Mon-Sun 8am-8pm'),
    ('Likoni Ferry Station',  'Ferry Road, Likoni, Mombasa',             '4.0606',  '39.6634', 0,   'Mon-Fri 8am-5pm'),
    ('Bamburi Beach Station', 'Bamburi Beach Road, Bamburi',             '3.9833',  '39.7167', 80,  'Mon-Sat 9am-7pm'),
]
for name, address, lat, lng, fee, hours in stations:
    PickupStation.objects.get_or_create(
        name=name, region=mombasa,
        defaults={'address': address, 'latitude': lat, 'longitude': lng,
                  'pickup_fee': fee, 'opening_hours': hours}
    )

# ── Delivery Zones (Mombasa) ──────────────────────────────
zones = [
    ('Mombasa Island (CBD, Old Town)',              200, '1-2 days'),
    ('Mainland North — Nyali, Bamburi, Shanzu',     350, '1-2 days'),
    ('Mainland South — Likoni, Shelly Beach',       350, '2-3 days'),
    ('Kilifi Town',                                 500, '2-3 days'),
    ('Malindi',                                     700, '3-4 days'),
    ('Watamu / Gede',                               750, '3-4 days'),
]
for name, fee, days in zones:
    DeliveryZone.objects.get_or_create(
        region=mombasa, name=name,
        defaults={'delivery_fee': Decimal(str(fee)), 'estimated_days': days}
    )

# ── Pickup Stations (Nairobi) ─────────────────────────────
nairobi = Region.objects.get(name='Nairobi')
nairobi_stations = [
    ('Westgate Station',     'Westgate Mall, Westlands, Nairobi',  '-1.2574', '36.8066', 0,   'Mon-Sun 9am-8pm'),
    ('Garden City Station',  'Garden City Mall, Thika Road',       '-1.2328', '36.8794', 50,  'Mon-Sun 9am-8pm'),
    ('Junction Station',     'Ngong Road, Dagoretti Corner',       '-1.2978', '36.7869', 0,   'Mon-Sat 8am-7pm'),
]
for name, address, lat, lng, fee, hours in nairobi_stations:
    PickupStation.objects.get_or_create(
        name=name, region=nairobi,
        defaults={'address': address, 'latitude': lat, 'longitude': lng,
                  'pickup_fee': fee, 'opening_hours': hours}
    )

print("✅ Seed data loaded successfully!")
```

Then seed products via the Django admin at `http://localhost:8000/admin/`.

---

## 🗺️ Map Integration

`CheckoutPage.jsx` contains a `MapModal` with a ready-to-replace placeholder.
Each `PickupStation` exposes `latitude` and `longitude` from the API.

**Option A — React Leaflet (free, OpenStreetMap):**
```bash
npm install react-leaflet leaflet
```
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[-4.0435, 39.6682]} zoom={12} style={{ height: 400 }}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {stations.map(st => (
    <Marker key={st.id} position={[st.latitude, st.longitude]}>
      <Popup>
        <strong>{st.name}</strong><br />
        {st.address}<br />
        Fee: {st.pickup_fee === 0 ? 'FREE' : `KES ${st.pickup_fee}`}
      </Popup>
    </Marker>
  ))}
</MapContainer>
```

**Option B — Google Maps:**
```bash
npm install @react-google-maps/api
```
```jsx
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
```

---

## 🛡️ Age Verification & Compliance

- **`AgeGate.jsx`** — Full-screen overlay on first visit. Stores confirmation in `sessionStorage`.
- Checkout footer: *"You must be 18+ to purchase alcohol. Valid ID may be required."*
- Footer: *"Must be 18+ to purchase alcohol."*
- M-Pesa STK push instructions shown at payment step.

---

## 🎨 Theme & Design

| Design token | Value |
|---|---|
| Primary (amber gold) | `#c8860a` |
| Secondary (dark brown) | `#1a0a00` |
| Accent (red-orange) | `#e8400d` |
| Success green | `#2e7d32` |
| Heading font | Montserrat (700, 800) |
| Body font | Open Sans (400, 500, 600) |
| Icons | Bootstrap Icons 1.11 (CDN) |

CSS custom properties are defined in `:root` inside `src/styles/main.css` — change the primary colour there to rebrand the entire site.

---

## 📦 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend framework | Django | 4.2+ |
| REST API | Django REST Framework | 3.14+ |
| Filtering | django-filter | 23.5+ |
| CORS | django-cors-headers | 4.3+ |
| Image processing | Pillow | 10.0+ |
| Frontend framework | React | 18 |
| Build tool | Vite | 5 |
| Routing | React Router | v6 |
| Icons | Bootstrap Icons | 1.11 |
| Fonts | Google Fonts | — |
| Styling | Vanilla CSS (custom) | — |

---

## 🔮 Recommended Next Steps

- [ ] Add **JWT authentication** (djangorestframework-simplejwt) for user accounts
- [ ] Integrate **M-Pesa Daraja API** for real STK push payments
- [ ] Replace map placeholder with **React Leaflet** or **Google Maps**
- [ ] Add **product search autocomplete** (Algolia or Django Haystack)
- [ ] Deploy backend to **Railway / Render** and frontend to **Vercel / Netlify**
- [ ] Add **PostgreSQL** in production (replace SQLite)
- [ ] Set up **Cloudinary** or **AWS S3** for media/image hosting
- [ ] Add **Redis** for session + cart caching

---

*Built for Spiritz — Kenya's Premier Online Liquor Store 🥃*
*Must be 18+ to purchase alcohol. Drink responsibly.*