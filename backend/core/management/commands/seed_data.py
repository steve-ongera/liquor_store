"""
Management command to seed the database with 120 liquor products.
Images are picked randomly from: D:/gadaf/Documents/images/jumia

Usage:
    python manage.py seed_products
    python manage.py seed_products --clear        # wipe existing data first
    python manage.py seed_products --images-dir "C:/custom/path"
"""

import os
import random
import uuid
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.core.files import File
from django.utils.text import slugify


# ─── Catalogue data ───────────────────────────────────────────────────────────

CATEGORIES = [
    {"name": "Whiskey",      "icon": "bi-cup-hot",        "description": "Single malts, blends and bourbons from around the world."},
    {"name": "Vodka",        "icon": "bi-droplet",        "description": "Premium and flavoured vodkas."},
    {"name": "Rum",          "icon": "bi-tropical-storm", "description": "White, dark and spiced rums."},
    {"name": "Gin",          "icon": "bi-flower1",        "description": "London dry, flavoured and craft gins."},
    {"name": "Tequila",      "icon": "bi-stars",          "description": "Blanco, reposado and añejo tequilas."},
    {"name": "Wine",         "icon": "bi-cup-straw",      "description": "Red, white and rosé wines."},
    {"name": "Beer & Cider", "icon": "bi-cup",            "description": "Local and imported beers and ciders."},
    {"name": "Brandy",       "icon": "bi-award",          "description": "Cognac, armagnac and brandy."},
    {"name": "Liqueurs",     "icon": "bi-gem",            "description": "Cream, fruit and herbal liqueurs."},
    {"name": "Champagne",    "icon": "bi-balloon",        "description": "Champagne and sparkling wines."},
]

BRANDS = [
    {"name": "Johnnie Walker",   "country": "Scotland"},
    {"name": "Jack Daniel's",    "country": "USA"},
    {"name": "Absolut",          "country": "Sweden"},
    {"name": "Grey Goose",       "country": "France"},
    {"name": "Bacardi",          "country": "Puerto Rico"},
    {"name": "Captain Morgan",   "country": "USA"},
    {"name": "Hendrick's",       "country": "Scotland"},
    {"name": "Tanqueray",        "country": "Scotland"},
    {"name": "Jose Cuervo",      "country": "Mexico"},
    {"name": "Don Julio",        "country": "Mexico"},
    {"name": "Moët & Chandon",   "country": "France"},
    {"name": "Veuve Clicquot",   "country": "France"},
    {"name": "Jameson",          "country": "Ireland"},
    {"name": "Glenfiddich",      "country": "Scotland"},
    {"name": "The Macallan",     "country": "Scotland"},
    {"name": "Courvoisier",      "country": "France"},
    {"name": "Baileys",          "country": "Ireland"},
    {"name": "Kahlúa",           "country": "Mexico"},
    {"name": "Olmeca",           "country": "Mexico"},
    {"name": "Kibao",            "country": "Kenya"},
    {"name": "Konyagi",          "country": "Tanzania"},
    {"name": "Kenya Cane",       "country": "Kenya"},
    {"name": "Chrome Vodka",     "country": "Kenya"},
    {"name": "Tusker",           "country": "Kenya"},
    {"name": "Guinness",         "country": "Ireland"},
]

# 120 products: name, category, brand, volume, abv, price, old_price, flags
PRODUCTS = [
    # ── Whiskey (20) ──────────────────────────────────────────────────────────
    ("Johnnie Walker Red Label",       "Whiskey", "Johnnie Walker",  "750ml", 40.0, 2500, 2800,  False, True,  False),
    ("Johnnie Walker Black Label",     "Whiskey", "Johnnie Walker",  "750ml", 40.0, 4200, 4800,  True,  True,  False),
    ("Johnnie Walker Blue Label",      "Whiskey", "Johnnie Walker",  "750ml", 40.0, 18000,None,  True,  False, False),
    ("Johnnie Walker Double Black",    "Whiskey", "Johnnie Walker",  "1L",    40.0, 5500, 6000,  False, True,  True),
    ("Johnnie Walker Gold Reserve",    "Whiskey", "Johnnie Walker",  "750ml", 40.0, 8500, None,  False, False, False),
    ("Jack Daniel's Old No.7",         "Whiskey", "Jack Daniel's",   "750ml", 40.0, 3800, 4200,  True,  True,  False),
    ("Jack Daniel's Honey",            "Whiskey", "Jack Daniel's",   "750ml", 35.0, 3500, 3900,  False, True,  True),
    ("Jack Daniel's Single Barrel",    "Whiskey", "Jack Daniel's",   "750ml", 45.0, 7500, None,  False, False, False),
    ("Jack Daniel's Tennessee Fire",   "Whiskey", "Jack Daniel's",   "750ml", 35.0, 3500, 3900,  False, False, True),
    ("Jameson Irish Whiskey",          "Whiskey", "Jameson",         "750ml", 40.0, 3200, 3600,  True,  True,  False),
    ("Jameson Black Barrel",           "Whiskey", "Jameson",         "750ml", 40.0, 5000, 5500,  False, True,  False),
    ("Glenfiddich 12YO",               "Whiskey", "Glenfiddich",     "750ml", 40.0, 5500, 6200,  True,  False, False),
    ("Glenfiddich 15YO",               "Whiskey", "Glenfiddich",     "750ml", 40.0, 8000, None,  False, False, False),
    ("Glenfiddich 18YO",               "Whiskey", "Glenfiddich",     "750ml", 40.0, 14000,None,  False, False, False),
    ("The Macallan 12YO",              "Whiskey", "The Macallan",    "750ml", 40.0, 9000, None,  True,  False, False),
    ("The Macallan 18YO",              "Whiskey", "The Macallan",    "750ml", 43.0, 28000,None,  False, False, False),
    ("Johnnie Walker Red Label",       "Whiskey", "Johnnie Walker",  "1L",    40.0, 3200, 3600,  False, True,  False),
    ("Johnnie Walker Black Label",     "Whiskey", "Johnnie Walker",  "1L",    40.0, 5500, 6200,  True,  True,  False),
    ("Jameson Irish Whiskey",          "Whiskey", "Jameson",         "1L",    40.0, 4200, 4800,  False, True,  False),
    ("Jack Daniel's Old No.7",         "Whiskey", "Jack Daniel's",   "1L",    40.0, 4800, 5300,  True,  True,  True),

    # ── Vodka (15) ────────────────────────────────────────────────────────────
    ("Absolut Original",               "Vodka",   "Absolut",         "750ml", 40.0, 2800, 3200,  True,  True,  False),
    ("Absolut Citron",                 "Vodka",   "Absolut",         "750ml", 40.0, 2800, 3200,  False, False, True),
    ("Absolut Raspberry",              "Vodka",   "Absolut",         "750ml", 40.0, 2800, 3200,  False, False, True),
    ("Absolut Vanilla",                "Vodka",   "Absolut",         "750ml", 40.0, 2800, 3200,  False, False, True),
    ("Grey Goose Original",            "Vodka",   "Grey Goose",      "750ml", 40.0, 5500, 6000,  True,  False, False),
    ("Grey Goose Le Citron",           "Vodka",   "Grey Goose",      "750ml", 40.0, 5500, 6000,  False, False, True),
    ("Grey Goose La Poire",            "Vodka",   "Grey Goose",      "750ml", 40.0, 5500, 6000,  False, False, True),
    ("Absolut Original",               "Vodka",   "Absolut",         "1L",    40.0, 3500, 4000,  False, True,  False),
    ("Chrome Vodka",                   "Vodka",   "Chrome Vodka",    "750ml", 40.0, 900,  1100,  False, True,  False),
    ("Chrome Vodka",                   "Vodka",   "Chrome Vodka",    "1L",    40.0, 1200, 1400,  False, True,  False),
    ("Grey Goose Original",            "Vodka",   "Grey Goose",      "1L",    40.0, 7000, 7500,  True,  False, False),
    ("Absolut Elyx",                   "Vodka",   "Absolut",         "750ml", 42.3, 4500, None,  True,  False, False),
    ("Absolut Blue",                   "Vodka",   "Absolut",         "350ml", 40.0, 1200, 1400,  False, False, True),
    ("Chrome Vodka",                   "Vodka",   "Chrome Vodka",    "200ml", 40.0, 350,  None,  False, True,  False),
    ("Grey Goose VX",                  "Vodka",   "Grey Goose",      "750ml", 40.0, 9500, None,  True,  False, False),

    # ── Rum (12) ──────────────────────────────────────────────────────────────
    ("Bacardi Carta Blanca",           "Rum",     "Bacardi",         "750ml", 37.5, 2200, 2600,  True,  True,  False),
    ("Bacardi Carta Negra",            "Rum",     "Bacardi",         "750ml", 40.0, 2400, 2800,  False, False, False),
    ("Bacardi Spiced",                 "Rum",     "Bacardi",         "750ml", 35.0, 2400, 2800,  False, False, True),
    ("Bacardi Oakheart",               "Rum",     "Bacardi",         "750ml", 35.0, 2800, None,  False, False, True),
    ("Captain Morgan Original Spiced", "Rum",     "Captain Morgan",  "750ml", 35.0, 2500, 2900,  True,  True,  False),
    ("Captain Morgan Dark",            "Rum",     "Captain Morgan",  "750ml", 40.0, 2600, None,  False, False, False),
    ("Captain Morgan White",           "Rum",     "Captain Morgan",  "750ml", 37.5, 2400, 2800,  False, False, True),
    ("Bacardi Carta Blanca",           "Rum",     "Bacardi",         "1L",    37.5, 2900, 3300,  True,  True,  False),
    ("Captain Morgan Original Spiced", "Rum",     "Captain Morgan",  "1L",    35.0, 3200, 3700,  False, True,  False),
    ("Bacardi Limon",                  "Rum",     "Bacardi",         "750ml", 32.0, 2400, 2800,  False, False, True),
    ("Kenya Cane Spirit",              "Rum",     "Kenya Cane",      "750ml", 37.5, 800,  950,   False, True,  False),
    ("Kenya Cane Spirit",              "Rum",     "Kenya Cane",      "1L",    37.5, 1050, 1200,  False, True,  False),

    # ── Gin (12) ──────────────────────────────────────────────────────────────
    ("Hendrick's Gin",                 "Gin",     "Hendrick's",      "750ml", 41.4, 5500, 6000,  True,  True,  False),
    ("Hendrick's Orbium",              "Gin",     "Hendrick's",      "750ml", 43.4, 7000, None,  False, False, False),
    ("Hendrick's Midsummer Solstice",  "Gin",     "Hendrick's",      "750ml", 43.4, 6500, None,  False, False, True),
    ("Tanqueray London Dry",           "Gin",     "Tanqueray",       "750ml", 47.3, 3200, 3700,  True,  True,  False),
    ("Tanqueray No. Ten",              "Gin",     "Tanqueray",       "750ml", 47.3, 5000, 5500,  True,  False, False),
    ("Tanqueray Sevilla",              "Gin",     "Tanqueray",       "750ml", 41.3, 3800, 4200,  False, False, True),
    ("Tanqueray Flor de Sevilla",      "Gin",     "Tanqueray",       "750ml", 41.3, 3800, 4200,  False, False, True),
    ("Hendrick's Gin",                 "Gin",     "Hendrick's",      "1L",    41.4, 7000, 7500,  True,  True,  False),
    ("Tanqueray London Dry",           "Gin",     "Tanqueray",       "1L",    47.3, 4200, 4800,  False, True,  False),
    ("Konyagi Spirit",                 "Gin",     "Konyagi",         "750ml", 30.0, 1100, 1300,  False, True,  False),
    ("Konyagi Spirit",                 "Gin",     "Konyagi",         "1L",    30.0, 1400, 1600,  False, True,  False),
    ("Tanqueray Rangpur",              "Gin",     "Tanqueray",       "750ml", 41.3, 4000, 4500,  False, False, True),

    # ── Tequila (10) ──────────────────────────────────────────────────────────
    ("Jose Cuervo Especial Silver",    "Tequila", "Jose Cuervo",     "750ml", 38.0, 3000, 3400,  True,  True,  False),
    ("Jose Cuervo Especial Gold",      "Tequila", "Jose Cuervo",     "750ml", 38.0, 3000, 3400,  False, True,  False),
    ("Jose Cuervo Tradicional",        "Tequila", "Jose Cuervo",     "750ml", 38.0, 3800, None,  False, False, False),
    ("Don Julio Blanco",               "Tequila", "Don Julio",       "750ml", 38.0, 6000, 6500,  True,  False, False),
    ("Don Julio Reposado",             "Tequila", "Don Julio",       "750ml", 38.0, 7000, None,  True,  False, False),
    ("Don Julio 1942",                 "Tequila", "Don Julio",       "750ml", 38.0, 22000,None,  False, False, False),
    ("Olmeca Blanco",                  "Tequila", "Olmeca",          "750ml", 38.0, 2800, 3200,  False, True,  False),
    ("Olmeca Reposado",                "Tequila", "Olmeca",          "750ml", 38.0, 3000, 3400,  False, True,  False),
    ("Jose Cuervo Especial Silver",    "Tequila", "Jose Cuervo",     "1L",    38.0, 3800, 4300,  False, True,  False),
    ("Olmeca Altos Plata",             "Tequila", "Olmeca",          "750ml", 40.0, 4500, 5000,  False, False, True),

    # ── Wine (15) ─────────────────────────────────────────────────────────────
    ("Nederburg Cabernet Sauvignon",   "Wine",    "Johnnie Walker",  "750ml", 13.5, 1200, 1500,  True,  True,  False),
    ("Nederburg Shiraz",               "Wine",    "Johnnie Walker",  "750ml", 13.5, 1200, 1500,  False, True,  False),
    ("Nederburg Chardonnay",           "Wine",    "Johnnie Walker",  "750ml", 13.0, 1200, 1500,  False, False, True),
    ("Drostdy-Hof Cabernet Sauvignon", "Wine",    "Johnnie Walker",  "750ml", 13.5, 850,  1000,  True,  True,  False),
    ("Drostdy-Hof Chardonnay",         "Wine",    "Johnnie Walker",  "750ml", 12.5, 850,  1000,  False, False, True),
    ("Four Cousins Natural Sweet Red", "Wine",    "Johnnie Walker",  "750ml", 12.0, 700,  850,   False, True,  False),
    ("Four Cousins Natural Sweet Rose","Wine",    "Johnnie Walker",  "750ml", 12.0, 700,  850,   False, True,  True),
    ("Four Cousins Natural Sweet White","Wine",   "Johnnie Walker",  "750ml", 12.0, 700,  850,   False, True,  True),
    ("J.P. Chenet Merlot",             "Wine",    "Johnnie Walker",  "750ml", 12.5, 1100, None,  True,  False, False),
    ("J.P. Chenet Rosé",               "Wine",    "Johnnie Walker",  "750ml", 12.0, 1100, None,  False, False, True),
    ("Nederburg Sauvignon Blanc",      "Wine",    "Johnnie Walker",  "750ml", 12.5, 1200, 1500,  False, False, True),
    ("Drostdy-Hof Merlot",             "Wine",    "Johnnie Walker",  "750ml", 13.0, 850,  1000,  False, True,  False),
    ("Four Cousins Pinotage",          "Wine",    "Johnnie Walker",  "750ml", 13.0, 750,  900,   False, False, True),
    ("J.P. Chenet Chardonnay",         "Wine",    "Johnnie Walker",  "750ml", 12.0, 1100, None,  False, False, True),
    ("J.P. Chenet Cabernet Shiraz",    "Wine",    "Johnnie Walker",  "750ml", 13.0, 1100, None,  False, True,  False),

    # ── Beer & Cider (10) ─────────────────────────────────────────────────────
    ("Tusker Lager 500ml",             "Beer & Cider", "Tusker",     "500ml", 4.2,  180,  None,  False, True,  False),
    ("Tusker Malt 500ml",              "Beer & Cider", "Tusker",     "500ml", 5.0,  190,  None,  False, True,  False),
    ("Tusker Lite 500ml",              "Beer & Cider", "Tusker",     "500ml", 3.5,  180,  None,  False, True,  True),
    ("Guinness Foreign Extra 500ml",   "Beer & Cider", "Guinness",   "500ml", 7.5,  250,  None,  True,  True,  False),
    ("Guinness Smooth 330ml",          "Beer & Cider", "Guinness",   "350ml", 4.1,  200,  None,  False, True,  False),
    ("Tusker Cider 500ml",             "Beer & Cider", "Tusker",     "500ml", 5.0,  200,  None,  False, False, True),
    ("Savanna Dry 330ml",              "Beer & Cider", "Tusker",     "350ml", 6.0,  220,  None,  False, False, True),
    ("Tusker Lager 330ml",             "Beer & Cider", "Tusker",     "350ml", 4.2,  150,  None,  False, True,  False),
    ("Guinness Draught 440ml",         "Beer & Cider", "Guinness",   "500ml", 4.1,  280,  None,  True,  False, False),
    ("Smirnoff Ice 300ml",             "Beer & Cider", "Absolut",    "350ml", 4.5,  200,  None,  False, False, True),

    # ── Brandy (8) ────────────────────────────────────────────────────────────
    ("Courvoisier VS",                 "Brandy",  "Courvoisier",     "750ml", 40.0, 4500, 5000,  True,  True,  False),
    ("Courvoisier VSOP",               "Brandy",  "Courvoisier",     "750ml", 40.0, 7000, 7500,  False, False, False),
    ("Courvoisier XO",                 "Brandy",  "Courvoisier",     "750ml", 40.0, 18000,None,  True,  False, False),
    ("KWV 3YO Brandy",                 "Brandy",  "Johnnie Walker",  "750ml", 38.0, 1500, 1800,  False, True,  False),
    ("KWV 5YO Brandy",                 "Brandy",  "Johnnie Walker",  "750ml", 38.0, 2200, 2600,  False, True,  False),
    ("KWV 10YO Brandy",                "Brandy",  "Johnnie Walker",  "750ml", 38.0, 4500, None,  False, False, False),
    ("Courvoisier VS",                 "Brandy",  "Courvoisier",     "1L",    40.0, 5800, 6500,  False, True,  False),
    ("Martell VS",                     "Brandy",  "Courvoisier",     "750ml", 40.0, 5000, 5500,  True,  False, False),

    # ── Liqueurs (10) ─────────────────────────────────────────────────────────
    ("Baileys Original Irish Cream",   "Liqueurs","Baileys",         "750ml", 17.0, 3200, 3600,  True,  True,  False),
    ("Baileys Salted Caramel",         "Liqueurs","Baileys",         "750ml", 17.0, 3500, 3900,  False, False, True),
    ("Baileys Strawberries & Cream",   "Liqueurs","Baileys",         "750ml", 17.0, 3500, 3900,  False, False, True),
    ("Baileys Chocolate Luxe",         "Liqueurs","Baileys",         "750ml", 15.7, 3800, None,  False, False, True),
    ("Kahlúa Coffee Liqueur",          "Liqueurs","Kahlúa",          "750ml", 20.0, 3000, 3500,  True,  True,  False),
    ("Amarula Cream",                  "Liqueurs","Baileys",         "750ml", 17.0, 2500, 2900,  False, True,  False),
    ("Amarula Vanilla Spice",          "Liqueurs","Baileys",         "750ml", 15.5, 2800, None,  False, False, True),
    ("Kahlúa Mocha",                   "Liqueurs","Kahlúa",          "750ml", 20.0, 3000, 3500,  False, False, True),
    ("Baileys Original Irish Cream",   "Liqueurs","Baileys",         "1L",    17.0, 4000, 4500,  True,  True,  False),
    ("Frangelico Hazelnut",            "Liqueurs","Baileys",         "750ml", 20.0, 3500, None,  True,  False, False),

    # ── Champagne (8) ─────────────────────────────────────────────────────────
    ("Moët & Chandon Brut Imperial",   "Champagne","Moët & Chandon", "750ml", 12.0, 9000, None,  True,  True,  False),
    ("Moët & Chandon Ice Imperial",    "Champagne","Moët & Chandon", "750ml", 12.0, 10000,None,  False, False, False),
    ("Moët & Chandon Rosé Imperial",   "Champagne","Moët & Chandon", "750ml", 12.0, 10000,None,  True,  False, False),
    ("Veuve Clicquot Yellow Label",    "Champagne","Veuve Clicquot", "750ml", 12.0, 12000,None,  True,  False, False),
    ("Veuve Clicquot Rosé",            "Champagne","Veuve Clicquot", "750ml", 12.0, 13500,None,  False, False, False),
    ("Moët & Chandon Brut Imperial",   "Champagne","Moët & Chandon", "1.5L",  12.0, 18000,None,  False, False, False),
    ("J.C. Le Roux Le Domaine",        "Champagne","Moët & Chandon", "750ml", 11.5, 1800, 2200,  False, True,  False),
    ("J.C. Le Roux Le Domaine Rosé",   "Champagne","Moët & Chandon", "750ml", 11.5, 1800, 2200,  False, True,  True),
]

REVIEWS_POOL = [
    (5, "Absolutely fantastic!", "Smooth taste, great value for money. Will buy again!"),
    (5, "Premium quality", "One of the best I've ever had. Worth every shilling."),
    (4, "Great product", "Really enjoyed this. Slight burn but excellent finish."),
    (4, "Good buy", "Solid product. Delivery was fast too."),
    (3, "Decent", "Not bad. Does the job for casual evenings."),
    (5, "Love it!", "My go-to brand. Never disappoints."),
    (4, "Would recommend", "Good quality at this price point. Very happy."),
    (3, "Average", "Expected a bit more for the price but still enjoyable."),
    (5, "Superb!", "Incredible aroma and taste. Will be ordering more soon."),
    (4, "Nice one", "Clean, smooth and pleasant. Great for mixing cocktails."),
]


class Command(BaseCommand):
    help = "Seed the database with 120 liquor products, categories, brands, and sample reviews."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing products, categories, and brands before seeding.",
        )
        parser.add_argument(
            "--images-dir",
            default=r"D:\gadaf\Pictures\Camera Roll\images",
            help="Path to folder containing product images (default: D:\\gadaf\\Documents\\images\\jumia)",
        )
        parser.add_argument(
            "--no-reviews",
            action="store_true",
            help="Skip creating sample reviews.",
        )

    def handle(self, *args, **options):
        from core.models import (  # adjust 'store' to your actual app label
            Category, Brand, Product, ProductImage, Review, Region,
        )

        images_dir = Path(options["images_dir"])
        self.stdout.write(self.style.MIGRATE_HEADING("🍾 Liquor Store — Product Seeder"))

        # ── Gather image paths ───────────────────────────────────────────────
        image_files = []
        if images_dir.exists() and images_dir.is_dir():
            image_files = [
                p for p in images_dir.iterdir()
                if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif"}
            ]
            self.stdout.write(f"  📸 Found {len(image_files)} images in {images_dir}")
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"  ⚠  Images directory not found: {images_dir}\n"
                    "     Products will be seeded WITHOUT thumbnails."
                )
            )

        def pick_image():
            """Return a random image path or None."""
            return random.choice(image_files) if image_files else None

        # ── Optionally clear existing data ───────────────────────────────────
        if options["clear"]:
            self.stdout.write("  🗑  Clearing existing data…")
            Review.objects.all().delete()
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Brand.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("  ✅ Existing data cleared."))

        # ── Categories ───────────────────────────────────────────────────────
        self.stdout.write("  📂 Creating categories…")
        cat_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "icon": cat_data["icon"],
                    "description": cat_data["description"],
                    "is_active": True,
                },
            )
            cat_map[cat.name] = cat
            verb = "created" if created else "exists"
            self.stdout.write(f"    {'➕' if created else '·'} {cat.name} ({verb})")

        # ── Brands ───────────────────────────────────────────────────────────
        self.stdout.write("  🏷  Creating brands…")
        brand_map = {}
        for br_data in BRANDS:
            brand, created = Brand.objects.get_or_create(
                name=br_data["name"],
                defaults={
                    "country_of_origin": br_data["country"],
                    "is_active": True,
                },
            )
            brand_map[brand.name] = brand
            self.stdout.write(f"    {'➕' if created else '·'} {brand.name}")

        # ── Products ─────────────────────────────────────────────────────────
        self.stdout.write("  🍷 Creating 120 products…")
        created_products = []

        for idx, row in enumerate(PRODUCTS, start=1):
            (
                name, cat_name, brand_name, volume, abv,
                price, old_price, is_featured, is_best_seller, is_new_arrival,
            ) = row

            category = cat_map.get(cat_name)
            brand    = brand_map.get(brand_name)

            # Build a unique slug to avoid collisions on duplicates
            base_slug = slugify(f"{brand_name} {name} {volume}")
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            short_desc = (
                f"{volume} · {abv}% ABV · {category.name if category else ''} · "
                f"Imported by {brand.name if brand else ''}"
            )

            product_obj = Product(
                name=name,
                slug=slug,
                category=category,
                brand=brand,
                description=(
                    f"{name} is a premium {cat_name.lower()} product. "
                    f"Volume: {volume}. Alcohol by volume: {abv}%. "
                    f"{'On special offer — was KES ' + str(old_price) + '.' if old_price else ''} "
                    f"Available for delivery or pickup across Kenya."
                ),
                short_description=short_desc,
                price=Decimal(str(price)),
                old_price=Decimal(str(old_price)) if old_price else None,
                volume=volume,
                alcohol_content=Decimal(str(abv)),
                stock=random.randint(5, 200),
                is_available=True,
                is_featured=is_featured,
                is_best_seller=is_best_seller,
                is_new_arrival=is_new_arrival,
                meta_title=f"Buy {name} {volume} Online in Kenya | Best Price",
                meta_description=short_desc[:300],
            )
            product_obj.save()
            created_products.append(product_obj)

            # Attach a random thumbnail
            img_path = pick_image()
            if img_path:
                try:
                    with open(img_path, "rb") as img_file:
                        product_obj.thumbnail.save(
                            f"product_{product_obj.sku}_{img_path.name}",
                            File(img_file),
                            save=True,
                        )
                    # Also add as ProductImage
                    with open(img_path, "rb") as img_file:
                        pi = ProductImage(product=product_obj, is_primary=True, order=0)
                        pi.image.save(
                            f"pi_{product_obj.sku}_{img_path.name}",
                            File(img_file),
                            save=False,
                        )
                        pi.alt_text = f"{name} {volume}"
                        pi.save()
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f"    ⚠  Image error for {name}: {exc}"))

            self.stdout.write(f"    [{idx:>3}/120] ✅ {name} ({volume}) — KES {price}")

        # ── Sample Reviews ────────────────────────────────────────────────────
        if not options["no_reviews"]:
            self.stdout.write("  ⭐ Adding sample reviews…")
            # Create / get a demo reviewer
            reviewer, _ = User.objects.get_or_create(
                username="demo_reviewer",
                defaults={
                    "email": "reviewer@liquorstore.co.ke",
                    "first_name": "Demo",
                    "last_name": "Reviewer",
                },
            )
            if _:
                reviewer.set_password("password123")
                reviewer.save()

            reviewed = set()
            review_count = 0
            for product in random.sample(created_products, min(60, len(created_products))):
                if product.id in reviewed:
                    continue
                reviewed.add(product.id)

                rating, title, body = random.choice(REVIEWS_POOL)
                try:
                    Review.objects.get_or_create(
                        product=product,
                        user=reviewer,
                        defaults={
                            "rating": rating,
                            "title": title,
                            "body": body,
                            "is_verified_purchase": random.choice([True, False]),
                        },
                    )
                    review_count += 1
                except Exception:
                    pass

            self.stdout.write(f"    ✅ {review_count} reviews created.")

        # ── Summary ───────────────────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 55))
        self.stdout.write(self.style.SUCCESS(f"  🎉 Seeding complete!"))
        self.stdout.write(self.style.SUCCESS(f"     Categories : {Category.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"     Brands     : {Brand.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"     Products   : {Product.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"     Reviews    : {Review.objects.count()}"))
        self.stdout.write(self.style.SUCCESS("=" * 55))