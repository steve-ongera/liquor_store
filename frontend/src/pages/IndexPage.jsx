// src/pages/IndexPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const MOCK_CATEGORIES = [
  { name: 'Whisky', slug: 'whisky', icon: 'bi-cup-hot' },
  { name: 'Vodka', slug: 'vodka', icon: 'bi-droplet-fill' },
  { name: 'Wine', slug: 'wine', icon: 'bi-cup-straw' },
  { name: 'Gin', slug: 'gin', icon: 'bi-flower1' },
  { name: 'Rum', slug: 'rum', icon: 'bi-brightness-high' },
  { name: 'Brandy', slug: 'brandy', icon: 'bi-fire' },
  { name: 'Beer', slug: 'beer-cider', icon: 'bi-cup' },
  { name: 'Tequila', slug: 'tequila', icon: 'bi-moon-stars' },
  { name: 'Champagne', slug: 'champagne', icon: 'bi-stars' },
  { name: 'Liqueurs', slug: 'liqueurs', icon: 'bi-gem' },
];

function ProductRowSection({ title, icon, products, seeAllTo, loading }) {
  return (
    <div className="product-row-section page-section">
      <div className="section-header">
        <h2 className="section-title"><i className={`bi ${icon}`}></i>{title}</h2>
        <Link to={seeAllTo} className="section-see-all">
          See All <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
      <div className="product-scroll-wrap">
        <div className="products-row">
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} style={{ minWidth: 180, padding: 10 }}>
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
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [loadingDeals, setLoadingDeals] = useState(true);

  useEffect(() => {
    api.getFeatured().then(d => { setFeatured(d); setLoadingFeatured(false); }).catch(() => setLoadingFeatured(false));
    api.getNewArrivals().then(d => { setNewArrivals(d); setLoadingNew(false); }).catch(() => setLoadingNew(false));
    api.getBestSellers().then(d => { setBestSellers(d); setLoadingBest(false); }).catch(() => setLoadingBest(false));
    api.getDeals().then(d => { setDeals(d); setLoadingDeals(false); }).catch(() => setLoadingDeals(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="container">
        <div className="hero-section">
          <div className="hero-main-banner">
            <div className="hero-content">
              <div className="hero-tag">🔥 Weekend Deals</div>
              <h1>Premium Spirits<br /><span>Delivered Fast</span></h1>
              <p>Over 500+ premium brands. Pickup stations across Kenya<br />or delivered to your doorstep.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/store')}>
                  <i className="bi bi-shop"></i> Shop Now
                </button>
                <button className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }} onClick={() => navigate('/store?on_sale=true')}>
                  <i className="bi bi-lightning-charge-fill"></i> View Deals
                </button>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 24, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                <span><i className="bi bi-truck" style={{ marginRight: 4 }}></i>Fast Delivery</span>
                <span><i className="bi bi-shield-check" style={{ marginRight: 4 }}></i>Genuine Products</span>
                <span><i className="bi bi-geo-alt" style={{ marginRight: 4 }}></i>50+ Pickup Stations</span>
              </div>
            </div>
            <div className="hero-bg-bottle"><i className="bi bi-cup-hot-fill"></i></div>
          </div>

          <div className="hero-side-banners">
            <div className="side-banner side-banner-1">
              <div className="side-banner-icon"><i className="bi bi-stars"></i></div>
              <div>
                <h3>New Arrivals</h3>
                <p>Fresh from the cellar</p>
                <Link to="/store?is_new_arrival=true" style={{ color: '#90ee90', fontSize: 11, fontWeight: 700, marginTop: 6, display: 'block' }}>
                  Explore <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="side-banner side-banner-2">
              <div className="side-banner-icon"><i className="bi bi-award-fill"></i></div>
              <div>
                <h3>Top Rated</h3>
                <p>Customer favorites</p>
                <Link to="/store?ordering=-average_rating" style={{ color: '#aaaaff', fontSize: 11, fontWeight: 700, marginTop: 6, display: 'block' }}>
                  Explore <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="container page-section">
        <div className="categories-strip">
          <div style={{ padding: '0 16px 8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14 }}>
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

      {/* Deals Flash */}
      <div className="container">
        <ProductRowSection
          title="Flash Deals"
          icon="bi-lightning-charge-fill"
          products={deals}
          seeAllTo="/store?on_sale=true"
          loading={loadingDeals}
        />
      </div>

      {/* Promo banner row */}
      <div className="container page-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { bg: 'linear-gradient(135deg,#7b2d00,#c8501a)', icon: 'bi-truck', title: 'Free Delivery', sub: 'On orders over KES 3,000', accent: '#ffcc80' },
            { bg: 'linear-gradient(135deg,#003366,#0066cc)', icon: 'bi-shield-lock-fill', title: '100% Genuine', sub: 'All products are authentic', accent: '#80b3ff' },
            { bg: 'linear-gradient(135deg,#1a3a00,#3d7a00)', icon: 'bi-arrow-counterclockwise', title: 'Easy Returns', sub: '7-day hassle-free returns', accent: '#aaddaa' },
          ].map((b, i) => (
            <div key={i} style={{
              background: b.bg, borderRadius: 8, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12, color: 'white'
            }}>
              <i className={`bi ${b.icon}`} style={{ fontSize: 32, color: b.accent }}></i>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{b.title}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container">
        <ProductRowSection
          title="Featured Products"
          icon="bi-award"
          products={featured}
          seeAllTo="/store?is_featured=true"
          loading={loadingFeatured}
        />
      </div>

      {/* Best Sellers */}
      <div className="container">
        <ProductRowSection
          title="Best Sellers"
          icon="bi-fire"
          products={bestSellers}
          seeAllTo="/store?is_best_seller=true"
          loading={loadingBest}
        />
      </div>

      {/* New Arrivals */}
      <div className="container">
        <ProductRowSection
          title="New Arrivals"
          icon="bi-stars"
          products={newArrivals}
          seeAllTo="/store?is_new_arrival=true"
          loading={loadingNew}
        />
      </div>

      {/* Brands strip */}
      <div className="container page-section">
        <div style={{ background: 'white', borderRadius: 8, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="section-header" style={{ margin: '-16px -16px 16px', padding: '12px 16px' }}>
            <h2 className="section-title"><i className="bi bi-gem"></i>Top Brands</h2>
            <Link to="/store" className="section-see-all">All Brands <i className="bi bi-arrow-right"></i></Link>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Johnnie Walker','Jack Daniel\'s','Jameson','Smirnoff','Absolut','Hennessy','Captain Morgan','Bacardi','Gordon\'s','Tanqueray','Olmeca','Glenfiddich'].map(b => (
              <Link key={b} to={`/store?brand=${b.toLowerCase().replace(/[^a-z0-9]/g,'-')}`}
                style={{
                  background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                  borderRadius: 4, padding: '8px 16px', fontSize: 12, fontWeight: 600,
                  color: 'var(--gray-700)', transition: 'all .2s',
                  whiteSpace: 'nowrap'
                }}
              >{b}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}