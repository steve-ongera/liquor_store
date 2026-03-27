// src/pages/StorePage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const VOLUMES = ['200ml','350ml','500ml','750ml','1L','1.5L','2L','3L'];
const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-average_rating', label: 'Top Rated' },
  { value: '-total_reviews', label: 'Most Reviewed' },
  { value: '-discount_percentage', label: 'Biggest Discount' },
];

function FilterSidebar({ filters, onChange, brands, categories, onClearAll }) {
  const [minP, setMinP] = useState(filters.min_price || '');
  const [maxP, setMaxP] = useState(filters.max_price || '');

  const applyPrice = () => {
    onChange({ min_price: minP || undefined, max_price: maxP || undefined });
  };

  const toggleArray = (key, val) => {
    const current = filters[key] ? filters[key].split(',') : [];
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    onChange({ [key]: next.length ? next.join(',') : undefined });
  };

  const isChecked = (key, val) => {
    return filters[key] ? filters[key].split(',').includes(val) : false;
  };

  return (
    <aside className="filter-sidebar">
      {/* Header */}
      <div style={{ padding: '12px 14px', background: 'var(--secondary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Montserrat,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="bi bi-funnel-fill"></i> Filters
        </span>
        <button onClick={onClearAll} style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <div className="filter-group-title">Price (KES)</div>
        <div className="price-range-inputs">
          <input
            type="number" placeholder="Min" value={minP}
            onChange={e => setMinP(e.target.value)}
          />
          <span style={{ color: 'var(--gray-400)' }}>—</span>
          <input
            type="number" placeholder="Max" value={maxP}
            onChange={e => setMaxP(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={applyPrice}>
          Apply
        </button>
        {(filters.min_price || filters.max_price) && (
          <button className="filter-clear-btn" onClick={() => { setMinP(''); setMaxP(''); onChange({ min_price: undefined, max_price: undefined }); }}>
            Clear price
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="filter-group">
          <div className="filter-group-title">Category</div>
          {categories.map(cat => (
            <label key={cat.slug} className="filter-option">
              <input
                type="checkbox"
                checked={isChecked('category', cat.slug)}
                onChange={() => toggleArray('category', cat.slug)}
              />
              {cat.name}
              <span className="filter-count">{cat.product_count}</span>
            </label>
          ))}
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="filter-group">
          <div className="filter-group-title">Brand</div>
          {brands.slice(0, 12).map(b => (
            <label key={b.slug} className="filter-option">
              <input
                type="checkbox"
                checked={isChecked('brand', b.slug)}
                onChange={() => toggleArray('brand', b.slug)}
              />
              {b.name}
              <span className="filter-count">{b.product_count}</span>
            </label>
          ))}
        </div>
      )}

      {/* Volume */}
      <div className="filter-group">
        <div className="filter-group-title">Volume</div>
        {VOLUMES.map(v => (
          <label key={v} className="filter-option">
            <input
              type="checkbox"
              checked={isChecked('volume', v)}
              onChange={() => toggleArray('volume', v)}
            />
            {v}
          </label>
        ))}
      </div>

      {/* Special */}
      <div className="filter-group">
        <div className="filter-group-title">Special</div>
        <label className="filter-option">
          <input type="checkbox" checked={!!filters.on_sale} onChange={() => onChange({ on_sale: filters.on_sale ? undefined : 'true' })} />
          On Sale
        </label>
        <label className="filter-option">
          <input type="checkbox" checked={!!filters.is_new_arrival} onChange={() => onChange({ is_new_arrival: filters.is_new_arrival ? undefined : 'true' })} />
          New Arrivals
        </label>
        <label className="filter-option">
          <input type="checkbox" checked={!!filters.is_best_seller} onChange={() => onChange({ is_best_seller: filters.is_best_seller ? undefined : 'true' })} />
          Best Sellers
        </label>
        <label className="filter-option">
          <input type="checkbox" checked={!!filters.is_featured} onChange={() => onChange({ is_featured: filters.is_featured ? undefined : 'true' })} />
          Featured
        </label>
      </div>

      {/* Min Rating */}
      <div className="filter-group">
        <div className="filter-group-title">Min Rating</div>
        {[4, 3, 2].map(r => (
          <label key={r} className="filter-option">
            <input
              type="radio"
              name="min_rating"
              checked={filters.min_rating === String(r)}
              onChange={() => onChange({ min_rating: String(r) })}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span style={{ display: 'flex', gap: 2 }}>
              {Array(r).fill(0).map((_, i) => <i key={i} className="bi bi-star-fill" style={{ color: '#ffa500', fontSize: 12 }}></i>)}
              {Array(5 - r).fill(0).map((_, i) => <i key={i} className="bi bi-star" style={{ color: '#ddd', fontSize: 12 }}></i>)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>&amp; Up</span>
          </label>
        ))}
        {filters.min_rating && (
          <button className="filter-clear-btn" onClick={() => onChange({ min_rating: undefined })}>Clear</button>
        )}
      </div>
    </aside>
  );
}

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ count: 0, total_pages: 1, current_page: 1 });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Build filters from URL
  const getFilters = useCallback(() => {
    const obj = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return obj;
  }, [searchParams]);

  const filters = getFilters();

  useEffect(() => {
    api.getBrands().then(d => setBrands(Array.isArray(d) ? d : d.results || [])).catch(() => {});
    api.getCategories().then(d => setCategories(Array.isArray(d) ? d : d.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    for (const [k, v] of searchParams.entries()) params[k] = v;
    api.getProducts(params)
      .then(data => {
        setProducts(data.results || []);
        setPagination({ count: data.count, total_pages: data.total_pages, current_page: data.current_page });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateFilters = (updates) => {
    const params = {};
    for (const [k, v] of searchParams.entries()) params[k] = v;
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === '') delete params[k];
      else params[k] = v;
    }
    params.page = '1';
    setSearchParams(params);
  };

  const clearAll = () => setSearchParams({});

  const handlePage = (p) => {
    const params = {};
    for (const [k, v] of searchParams.entries()) params[k] = v;
    params.page = String(p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active filter pills
  const PILL_LABELS = {
    search: v => `Search: "${v}"`,
    brand: v => `Brand: ${v}`,
    category: v => `Category: ${v}`,
    volume: v => `Volume: ${v}`,
    min_price: v => `Min: KES ${v}`,
    max_price: v => `Max: KES ${v}`,
    on_sale: () => 'On Sale',
    is_new_arrival: () => 'New Arrivals',
    is_best_seller: () => 'Best Sellers',
    is_featured: () => 'Featured',
    min_rating: v => `${v}★ & Up`,
  };
  const activePills = Object.entries(filters).filter(([k]) => k !== 'page' && k !== 'ordering' && PILL_LABELS[k]);

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <span>Store</span>
        {filters.category && <><i className="bi bi-chevron-right"></i><span style={{ textTransform: 'capitalize' }}>{filters.category}</span></>}
      </div>

      <div className="store-layout">
        <FilterSidebar
          filters={filters}
          onChange={updateFilters}
          brands={brands}
          categories={categories}
          onClearAll={clearAll}
        />

        <div className="listing-area">
          {/* Toolbar */}
          <div className="listing-toolbar">
            <div className="listing-result-count">
              {loading ? 'Loading...' : <><strong>{pagination.count.toLocaleString()}</strong> products found</>}
            </div>
            <div className="listing-sort">
              <label>Sort by:</label>
              <select value={filters.ordering || '-created_at'} onChange={e => updateFilters({ ordering: e.target.value })}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {activePills.length > 0 && (
            <div className="active-filters">
              {activePills.map(([k, v]) => (
                <div key={k} className="filter-pill">
                  {PILL_LABELS[k]?.(v)}
                  <button onClick={() => updateFilters({ [k]: undefined })}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
              <button className="filter-pill" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }} onClick={clearAll}>
                Clear All <i className="bi bi-x-circle"></i>
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="listing-products-grid">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} style={{ padding: 10, background: 'white', margin: 1 }}>
                  <div className="skeleton" style={{ height: 180, marginBottom: 8 }}></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 8 }}>
              <i className="bi bi-search" style={{ fontSize: 64, color: 'var(--gray-300)', display: 'block', marginBottom: 16 }}></i>
              <h3 style={{ color: 'var(--gray-600)', marginBottom: 8 }}>No products found</h3>
              <p style={{ color: 'var(--gray-400)', marginBottom: 20 }}>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={clearAll}>Clear Filters</button>
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