// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const SUBNAV = [
  { label: 'All Categories', icon: 'bi-grid-fill', cls: 'subnav-all-cats', to: '/store' },
  { label: 'Whisky',         icon: 'bi-cup-hot',             to: '/category/whisky' },
  { label: 'Vodka',          icon: 'bi-droplet',              to: '/category/vodka' },
  { label: 'Wine',           icon: 'bi-cup-straw',            to: '/category/wine' },
  { label: 'Beer & Cider',   icon: 'bi-cup',                  to: '/category/beer-cider' },
  { label: 'Gin',            icon: 'bi-flower1',              to: '/category/gin' },
  { label: 'Rum',            icon: 'bi-brightness-high',      to: '/category/rum' },
  { label: 'Brandy',         icon: 'bi-fire',                 to: '/category/brandy' },
  { label: 'Champagne',      icon: 'bi-stars',                to: '/category/champagne' },
  { label: 'Deals',          icon: 'bi-lightning-charge-fill',to: '/store?on_sale=true' },
];

const DRAWER_LINKS = [
  { section: 'Shop', items: SUBNAV.slice(1) },
  {
    section: 'Account',
    items: [
      { label: 'My Account',   icon: 'bi-person',       to: '/account' },
      { label: 'Wishlist',     icon: 'bi-heart',         to: '/wishlist' },
      { label: 'My Orders',    icon: 'bi-bag-check',     to: '/orders' },
      { label: 'Track Order',  icon: 'bi-geo-alt',       to: '/track-order' },
    ],
  },
  {
    section: 'Help',
    items: [
      { label: 'Help & FAQ',   icon: 'bi-question-circle', to: '/help' },
      { label: 'Contact Us',   icon: 'bi-chat-dots',        to: '/contact' },
    ],
  },
];

export default function Header({ categories = [] }) {
  const { cart } = useCart();
  const [search, setSearch]       = useState('');
  const [drawerOpen, setDrawer]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Close drawer on route change
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/store?search=${encodeURIComponent(search.trim())}`);
  };

  const itemCount = cart.item_count > 99 ? '99+' : cart.item_count;

  return (
    <>
      {/* ── Mobile Drawer Overlay ── */}
      <div
        className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Nav Drawer ── */}
      <nav className={`mobile-nav-drawer ${drawerOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        {/* Drawer Header */}
        <div className="drawer-header">
          <Link to="/" className="logo" onClick={() => setDrawer(false)}>
            <div className="logo-icon"><i className="bi bi-cup-hot-fill"></i></div>
            <span className="logo-text">Spir<span>itz</span></span>
          </Link>
          <button
            className="drawer-close-btn"
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {DRAWER_LINKS.map(({ section, items }) => (
            <div key={section}>
              <div className="drawer-section-label">{section}</div>
              {items.map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="drawer-nav-item"
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </Link>
              ))}
              <div className="drawer-divider" />
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
            <i className="bi bi-telephone-fill" style={{ marginRight: 6, color: 'var(--brand-gold-dim)' }}></i>
            +254 700 000 000<br />
            <i className="bi bi-envelope-fill" style={{ marginRight: 6, color: 'var(--brand-gold-dim)' }}></i>
            hello@spiritz.co.ke
          </div>
        </div>
      </nav>

      {/* ── Sticky Header ── */}
      <header className="site-header">

        {/* Topbar */}
        <div className="header-topbar">
          <div className="container">
            <div className="topbar-left">
              <span><i className="bi bi-telephone-fill" style={{ marginRight: 5 }}></i>+254 700 000 000</span>
              <div className="topbar-divider"></div>
              <span><i className="bi bi-envelope-fill" style={{ marginRight: 5 }}></i>hello@spiritz.co.ke</span>
            </div>
            <div className="topbar-right">
              <Link to="/track-order">Track Order</Link>
              <div className="topbar-divider"></div>
              <Link to="/help">Help &amp; FAQ</Link>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="header-main">
          <div className="container">

            {/* Hamburger — mobile only */}
            <button
              className="header-hamburger"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <i className="bi bi-list"></i>
            </button>

            {/* Logo */}
            <Link to="/" className="logo">
              <div className="logo-icon"><i className="bi bi-cup-hot-fill"></i></div>
              <span className="logo-text">Spir<span>itz</span></span>
            </Link>

            {/* Search */}
            <form className="header-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search whisky, vodka, wine, beer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" aria-label="Search">
                <i className="bi bi-search"></i>
              </button>
            </form>

            {/* Actions */}
            <div className="header-actions">
              <Link to="/account" className="header-action-btn" aria-label="Account">
                <i className="bi bi-person"></i>
                <span>Account</span>
              </Link>
              <Link to="/wishlist" className="header-action-btn" aria-label="Wishlist">
                <i className="bi bi-heart"></i>
                <span>Wishlist</span>
              </Link>
              <Link to="/cart" className="header-action-btn" aria-label={`Cart, ${cart.item_count} items`}>
                <i className="bi bi-bag"></i>
                <span>Cart</span>
                {cart.item_count > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Sub-nav */}
        <nav className="header-subnav" aria-label="Category navigation">
          <div className="container">
            {SUBNAV.map(item => (
              <Link
                key={item.label}
                to={item.to}
                className={`subnav-item ${item.cls || ''}`}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

      </header>
    </>
  );
}