// src/components/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header({ categories = [] }) {
  const { cart } = useCart();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/store?search=${encodeURIComponent(search.trim())}`);
  };

  const SUBNAV = [
    { label: 'All Categories', icon: 'bi-grid-fill', cls: 'subnav-all-cats', to: '/store' },
    { label: 'Whisky', icon: 'bi-cup-hot', to: '/category/whisky' },
    { label: 'Vodka', icon: 'bi-droplet', to: '/category/vodka' },
    { label: 'Wine', icon: 'bi-cup-straw', to: '/category/wine' },
    { label: 'Beer & Cider', icon: 'bi-cup', to: '/category/beer-cider' },
    { label: 'Gin', icon: 'bi-flower1', to: '/category/gin' },
    { label: 'Rum', icon: 'bi-brightness-high', to: '/category/rum' },
    { label: 'Brandy', icon: 'bi-fire', to: '/category/brandy' },
    { label: 'Deals', icon: 'bi-lightning-charge-fill', to: '/store?on_sale=true' },
  ];

  return (
    <header className="site-header">
      {/* Topbar */}
      <div className="header-topbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span><i className="bi bi-telephone-fill me-1"></i> +254 700 000 000 &nbsp;|&nbsp; <i className="bi bi-envelope-fill me-1"></i> hello@spiritz.co.ke</span>
          <span>
            <Link to="/track-order" style={{ marginRight: 12 }}>Track Order</Link>
            <Link to="/help">Help & FAQ</Link>
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div className="header-main">
        <div className="container">
          <Link to="/" className="logo">
            <div className="logo-icon"><i className="bi bi-cup-hot-fill"></i></div>
            <span className="logo-text">Spir<span>itz</span></span>
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search whisky, vodka, wine, beer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit"><i className="bi bi-search"></i></button>
          </form>

          <div className="header-actions">
            <Link to="/account" className="header-action-btn">
              <i className="bi bi-person"></i>
              <span>Account</span>
            </Link>
            <Link to="/wishlist" className="header-action-btn">
              <i className="bi bi-heart"></i>
              <span>Wishlist</span>
            </Link>
            <Link to="/cart" className="header-action-btn">
              <i className="bi bi-bag"></i>
              <span>Cart</span>
              {cart.item_count > 0 && (
                <span className="cart-badge">{cart.item_count > 99 ? '99+' : cart.item_count}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <nav className="header-subnav">
        <div className="container">
          {SUBNAV.map(item => (
            <Link key={item.label} to={item.to} className={`subnav-item ${item.cls || ''}`}>
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}