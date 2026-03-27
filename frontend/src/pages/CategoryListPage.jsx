// src/pages/CategoryListPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-average_rating', label: 'Top Rated' },
  { value: '-discount_percentage', label: 'Biggest Discount' },
];

export default function CategoryListPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, total_pages: 1, current_page: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sort, setSort] = useState('-created_at');
  const [onSale, setOnSale] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    api.getCategory(slug).then(setCategory).catch(() => {});
    api.getBrands().then(d => setBrands(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    const params = {
      slug,
      page,
      ordering: sort,
      ...(selectedBrands.length && { brand: selectedBrands.join(',') }),
      ...(priceRange.min && { min_price: priceRange.min }),
      ...(priceRange.max && { max_price: priceRange.max }),
      ...(onSale && { on_sale: 'true' }),
    };
    api.getProductsByCategory(params)
      .then(data => {
        setProducts(data.results || []);
        setPagination({ count: data.count, total_pages: data.total_pages, current_page: data.current_page });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug, page, sort, selectedBrands, priceRange, onSale]);

  const handlePage = (p) => {
    setSearchParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBrand = (brandSlug) => {
    setSelectedBrands(prev =>
      prev.includes(brandSlug) ? prev.filter(b => b !== brandSlug) : [...prev, brandSlug]
    );
    setSearchParams({ page: '1' });
  };

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <Link to="/store">Store</Link>
        <i className="bi bi-chevron-right"></i>
        <span>{category?.name || slug}</span>
      </div>

      {/* Category Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, #3d1a00 60%, var(--primary-dark) 100%)',
        borderRadius: 8,
        padding: '24px 32px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary-light)', fontWeight: 600, marginBottom: 6 }}>
            Category
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', marginBottom: 6, color: 'white' }}>
            {category?.name || slug}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 400 }}>
            {category?.description || `Browse our premium selection of ${category?.name || slug}`}
          </p>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--primary-light)', fontWeight: 600 }}>
            <i className="bi bi-box-seam" style={{ marginRight: 6 }}></i>
            {pagination.count.toLocaleString()} products available
          </div>
        </div>
        <div style={{ fontSize: 100, opacity: 0.1, position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
          <i className={`bi ${category?.icon || 'bi-cup-hot-fill'}`}></i>
        </div>
      </div>

      <div className="store-layout">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div style={{ padding: '12px 14px', background: 'var(--secondary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Montserrat,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-funnel-fill"></i> Filters
            </span>
            <button onClick={() => { setSelectedBrands([]); setPriceRange({ min: '', max: '' }); setOnSale(false); }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              Clear All
            </button>
          </div>

          {/* Price */}
          <div className="filter-group">
            <div className="filter-group-title">Price (KES)</div>
            <div className="price-range-inputs">
              <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))} />
              <span style={{ color: 'var(--gray-400)' }}>—</span>
              <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }}>Apply</button>
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-title">Brand</div>
              {brands.slice(0, 15).map(b => (
                <label key={b.slug} className="filter-option">
                  <input type="checkbox" checked={selectedBrands.includes(b.slug)} onChange={() => toggleBrand(b.slug)} />
                  {b.name}
                  <span className="filter-count">{b.product_count}</span>
                </label>
              ))}
            </div>
          )}

          {/* Specials */}
          <div className="filter-group">
            <div className="filter-group-title">Special Offers</div>
            <label className="filter-option">
              <input type="checkbox" checked={onSale} onChange={e => setOnSale(e.target.checked)} />
              On Sale Only
            </label>
          </div>
        </aside>

        {/* Listing */}
        <div className="listing-area">
          <div className="listing-toolbar">
            <div className="listing-result-count">
              {loading ? 'Loading...' : <><strong>{pagination.count.toLocaleString()}</strong> products in {category?.name || slug}</>}
            </div>
            <div className="listing-sort">
              <label>Sort:</label>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active brand pills */}
          {selectedBrands.length > 0 && (
            <div className="active-filters">
              {selectedBrands.map(b => (
                <div key={b} className="filter-pill">
                  Brand: {brands.find(br => br.slug === b)?.name || b}
                  <button onClick={() => toggleBrand(b)}><i className="bi bi-x"></i></button>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="listing-products-grid">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} style={{ padding: 10, background: 'white', margin: 1 }}>
                  <div className="skeleton" style={{ height: 180, marginBottom: 8 }}></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 8 }}>
              <i className="bi bi-inbox" style={{ fontSize: 64, color: 'var(--gray-300)', display: 'block', marginBottom: 16 }}></i>
              <h3 style={{ color: 'var(--gray-600)', marginBottom: 8 }}>No products found</h3>
              <p style={{ color: 'var(--gray-400)' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="listing-products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePage}
          />
        </div>
      </div>
    </div>
  );
}