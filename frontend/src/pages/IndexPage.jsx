// src/pages/IndexPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const MOCK_CATEGORIES = [
  { name: 'Whisky',    slug: 'whisky',    icon: 'bi-cup-hot' },
  { name: 'Vodka',     slug: 'vodka',     icon: 'bi-droplet-fill' },
  { name: 'Wine',      slug: 'wine',      icon: 'bi-cup-straw' },
  { name: 'Gin',       slug: 'gin',       icon: 'bi-flower1' },
  { name: 'Rum',       slug: 'rum',       icon: 'bi-brightness-high' },
  { name: 'Brandy',    slug: 'brandy',    icon: 'bi-fire' },
  { name: 'Beer',      slug: 'beer-cider',icon: 'bi-cup' },
  { name: 'Tequila',   slug: 'tequila',   icon: 'bi-moon-stars' },
  { name: 'Champagne', slug: 'champagne', icon: 'bi-stars' },
  { name: 'Liqueurs',  slug: 'liqueurs',  icon: 'bi-gem' },
];

const PROMO_CARDS = [
  {
    bg: 'linear-gradient(135deg, #3d1500 0%, #7a3010 100%)',
    icon: 'bi-truck',
    title: 'Free Delivery',
    sub: 'On orders over KES 3,000',
    accent: 'var(--brand-gold)',
  },
  {
    bg: 'linear-gradient(135deg, #0a1628 0%, #143050 100%)',
    icon: 'bi-shield-lock-fill',
    title: '100% Genuine',
    sub: 'All products are authenticated',
    accent: '#7eb8f7',
  },
  {
    bg: 'linear-gradient(135deg, #0d2210 0%, #1a4020 100%)',
    icon: 'bi-arrow-counterclockwise',
    title: 'Easy Returns',
    sub: '7-day hassle-free returns',
    accent: '#7dd4a0',
  },
];

function ProductRowSection({ title, icon, products, seeAllTo, loading }) {
  return (
    <div className="product-row-section page-section">
      <div className="section-header">
        <h2 className="section-title">
          <i className={`bi ${icon}`}></i>
          {title}
        </h2>
        <Link to={seeAllTo} className="section-see-all">
          See All <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
      <div className="product-scroll-wrap">
        <div className="products-row">
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} style={{ minWidth: 190, padding: 12 }}>
                  <div className="skeleton skeleton-card"></div>
                </div>
              ))
            : products.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>
    </div>
  );
}

export default function IndexPage() {
  const navigate = useNavigate();
  const [featured,    setFeatured]    = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [deals,       setDeals]       = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew,      setLoadingNew]      = useState(true);
  const [loadingBest,     setLoadingBest]     = useState(true);
  const [loadingDeals,    setLoadingDeals]    = useState(true);

  useEffect(() => {
    api.getFeatured().then(d    => { setFeatured(d);    setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    api.getNewArrivals().then(d => { setNewArrivals(d); setLoadingNew(false);      }).catch(() => setLoadingNew(false));
    api.getBestSellers().then(d => { setBestSellers(d); setLoadingBest(false);     }).catch(() => setLoadingBest(false));
    api.getDeals().then(d       => { setDeals(d);       setLoadingDeals(false);    }).catch(() => setLoadingDeals(false));
  }, []);

  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="container">
        <div className="hero-section">

          {/* Main banner */}
          <div className="hero-main-banner">
            <div className="hero-content">
              <div className="hero-tag">
                <i className="bi bi-lightning-charge-fill"></i>
                Weekend Deals
              </div>

              <h1>
                Premium Spirits<br />
                <span>Delivered Fast</span>
              </h1>

              <p>
                Over 500+ premium brands. Pickup stations across Kenya
                or delivered to your doorstep.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/store')}
                >
                  <i className="bi bi-shop"></i> Shop Now
                </button>
                <button
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(201,168,76,0.35)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                  onClick={() => navigate('/store?on_sale=true')}
                >
                  <i className="bi bi-lightning-charge-fill" style={{ color: 'var(--brand-gold)' }}></i>
                  View Deals
                </button>
              </div>

              <div className="hero-meta">
                <span><i className="bi bi-truck"></i>Fast Delivery</span>
                <span><i className="bi bi-shield-check"></i>Genuine Products</span>
                <span><i className="bi bi-geo-alt"></i>50+ Pickup Stations</span>
              </div>
            </div>

            <div className="hero-bg-bottle">
              <i className="bi bi-cup-hot-fill"></i>
            </div>
          </div>

          {/* Side banners */}
          <div className="hero-side-banners">
            <div className="side-banner side-banner-1">
              <div className="side-banner-icon"><i className="bi bi-stars"></i></div>
              <div>
                <h3>New Arrivals</h3>
                <p>Fresh from the cellar</p>
                <Link
                  to="/store?is_new_arrival=true"
                  style={{
                    color: 'var(--brand-gold-light)',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Explore <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className="side-banner side-banner-2">
              <div className="side-banner-icon"><i className="bi bi-award-fill"></i></div>
              <div>
                <h3>Top Rated</h3>
                <p>Customer favorites</p>
                <Link
                  to="/store?ordering=-average_rating"
                  style={{
                    color: 'rgba(180,180,255,0.9)',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Explore <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category strip ───────────────────────────────────── */}
      <div className="container page-section">
        <div className="categories-strip">
          <div style={{
            padding: '0 20px 10px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 18,
            color: 'var(--gray-800)',
            letterSpacing: '-0.01em',
          }}>
            Shop by Category
          </div>
          <div className="categories-strip-inner">
            {MOCK_CATEGORIES.map(cat => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="cat-icon-item">
                <div className="cat-icon-wrap">
                  <i className={`bi ${cat.icon}`}></i>
                </div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Flash Deals ──────────────────────────────────────── */}
      <div className="container">
        <ProductRowSection
          title="Flash Deals"
          icon="bi-lightning-charge-fill"
          products={deals}
          seeAllTo="/store?on_sale=true"
          loading={loadingDeals}
        />
      </div>

      {/* ── Promo strip ──────────────────────────────────────── */}
      <div className="container page-section">
        <div className="promo-strip">
          {PROMO_CARDS.map((b, i) => (
            <div
              key={i}
              className="promo-card"
              style={{ background: b.bg }}
            >
              <i
                className={`bi ${b.icon}`}
                style={{ fontSize: 34, color: b.accent, flexShrink: 0 }}
              ></i>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>{b.title}</div>
                <div style={{ fontSize: 11.5, opacity: 0.65 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured ─────────────────────────────────────────── */}
      <div className="container">
        <ProductRowSection
          title="Featured Products"
          icon="bi-award"
          products={featured}
          seeAllTo="/store?is_featured=true"
          loading={loadingFeatured}
        />
      </div>

      {/* ── Best Sellers ─────────────────────────────────────── */}
      <div className="container">
        <ProductRowSection
          title="Best Sellers"
          icon="bi-fire"
          products={bestSellers}
          seeAllTo="/store?is_best_seller=true"
          loading={loadingBest}
        />
      </div>

      {/* ── New Arrivals ─────────────────────────────────────── */}
      <div className="container">
        <ProductRowSection
          title="New Arrivals"
          icon="bi-stars"
          products={newArrivals}
          seeAllTo="/store?is_new_arrival=true"
          loading={loadingNew}
        />
      </div>

      {/* ── Top Brands ───────────────────────────────────────── */}
      <div className="container page-section">
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-light)',
        }}>
          <div className="section-header">
            <h2 className="section-title">
              <i className="bi bi-gem"></i>Top Brands
            </h2>
            <Link to="/store" className="section-see-all">
              All Brands <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '20px 24px',
          }}>
            {[
              "Johnnie Walker","Jack Daniel's","Jameson","Smirnoff",
              "Absolut","Hennessy","Captain Morgan","Bacardi",
              "Gordon's","Tanqueray","Olmeca","Glenfiddich",
            ].map(b => (
              <Link
                key={b}
                to={`/store?brand=${b.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 18px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--gray-700)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--brand-gold)';
                  e.currentTarget.style.color = 'var(--brand-gold-dim)';
                  e.currentTarget.style.background = 'rgba(201,168,76,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--gray-700)';
                  e.currentTarget.style.background = 'var(--surface)';
                }}
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}