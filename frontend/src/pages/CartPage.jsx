// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.total || 0;
  const FREE_DELIVERY_THRESHOLD = 3000;
  const progressPct = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  /* ── Empty state ─── */
  if (!cart.items?.length) {
    return (
      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="bi bi-chevron-right"></i>
          <span>Cart</span>
        </div>
        <div
          className="empty-cart"
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
          }}
        >
          <i className="bi bi-bag-x" style={{ color: 'var(--border)' }}></i>
          <h3>Your cart is empty</h3>
          <p>Add some premium spirits to get started!</p>
          <Link to="/store" className="btn btn-primary btn-lg">
            <i className="bi bi-shop"></i> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <span>Shopping Cart ({cart.item_count} {cart.item_count === 1 ? 'item' : 'items'})</span>
      </div>

      <div className="cart-layout">

        {/* ── Items panel ─── */}
        <div>
          <div className="cart-items-panel">
            <div className="cart-panel-header">
              <i className="bi bi-bag-check-fill"></i>
              Shopping Cart — {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
            </div>

            {cart.items.map(item => (
              <div key={item.id} className="cart-item">

                {/* Thumbnail */}
                <Link to={`/product/${item.product.slug}`} className="cart-item-img">
                  {item.product.thumbnail_url
                    ? <img src={item.product.thumbnail_url} alt={item.product.name} />
                    : <i className="bi bi-cup-hot-fill" style={{ fontSize: 36, color: 'var(--border)' }}></i>
                  }
                </Link>

                {/* Info */}
                <div>
                  <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <div className="cart-item-brand">
                    {item.product.brand_name} &middot; {item.product.volume}
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity - 1)}>
                        <i className="bi bi-dash"></i>
                      </button>
                      <input className="qty-input" type="number" value={item.quantity} readOnly />
                      <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity + 1)}>
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                      <i className="bi bi-trash3" style={{ marginRight: 4 }}></i>Remove
                    </button>
                    <button style={{ fontSize: 12, color: 'var(--brand-gold-dim)', fontWeight: 600 }}>
                      <i className="bi bi-heart" style={{ marginRight: 4 }}></i>Save
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="cart-item-price">
                    KES {Number(item.subtotal).toLocaleString()}
                  </div>
                  {item.product.old_price && (
                    <div className="cart-item-old-price">
                      KES {(Number(item.product.old_price) * item.quantity).toLocaleString()}
                    </div>
                  )}
                  {item.product.discount_percentage > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textAlign: 'right', marginTop: 2 }}>
                      -{item.product.discount_percentage}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Link to="/store" className="btn btn-outline">
              <i className="bi bi-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Summary sidebar ─── */}
        <div className="cart-summary">

          {/* Free delivery progress */}
          <div style={{
            background: 'white',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            marginBottom: 12,
            boxShadow: 'var(--shadow-xs)',
          }}>
            {subtotal >= FREE_DELIVERY_THRESHOLD ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--success)' }}>
                <i className="bi bi-truck-front-fill" style={{ fontSize: 18 }}></i>
                You qualify for FREE delivery! 🎉
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 8, fontWeight: 500 }}>
                  <i className="bi bi-truck" style={{ marginRight: 6, color: 'var(--brand-gold-dim)' }}></i>
                  Add <strong style={{ color: 'var(--gray-900)' }}>KES {(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()}</strong> more for free delivery
                </div>
                <div style={{ height: 6, background: 'var(--surface-raised)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, var(--brand-gold-dim), var(--brand-gold))',
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </>
            )}
          </div>

          {/* Order total */}
          <div className="cart-summary-box">
            <div className="cart-panel-header">
              <i className="bi bi-receipt"></i> Order Summary
            </div>
            <div className="summary-row">
              <span className="summary-label">Subtotal ({cart.item_count} items)</span>
              <span className="summary-value">KES {subtotal.toLocaleString()}</span>
            </div>
            {cart.items.some(i => i.product.discount_percentage > 0) && (
              <div className="summary-row">
                <span className="summary-label">Discount saved</span>
                <span className="summary-value discount">
                  − KES {cart.items.reduce((acc, item) => {
                    if (!item.product.old_price) return acc;
                    return acc + (Number(item.product.old_price) - Number(item.product.price)) * item.quantity;
                  }, 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Delivery</span>
              <span className="summary-value delivery">Calculated at checkout</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">KES {subtotal.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn-checkout" onClick={() => navigate('/checkout')}>
            <i className="bi bi-lock-fill"></i> Proceed to Checkout
          </button>

          {/* Payment icons */}
          <div style={{
            marginTop: 12,
            background: 'white',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bi bi-shield-check" style={{ color: 'var(--success)', fontSize: 13 }}></i>
              Secure Checkout
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: 'M-PESA',      bg: '#006600' },
                { label: 'VISA',        bg: '#1a1f71' },
                { label: 'MC',          bg: '#eb001b' },
                { label: 'CASH',        bg: 'var(--gray-700)' },
              ].map(p => (
                <span
                  key={p.label}
                  className="payment-icon"
                  style={{ background: p.bg, color: 'white' }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}