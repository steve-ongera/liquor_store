// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.total || 0;

  if (!cart.items?.length) {
    return (
      <div className="container" style={{ paddingTop: 20 }}>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="bi bi-chevron-right"></i>
          <span>Cart</span>
        </div>
        <div className="empty-cart" style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <i className="bi bi-bag-x"></i>
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
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <span>Shopping Cart ({cart.item_count} items)</span>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div>
          <div className="cart-items-panel">
            <div className="cart-panel-header">
              <i className="bi bi-bag-check-fill"></i>
              Shopping Cart — {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
            </div>

            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                {/* Image */}
                <Link to={`/product/${item.product.slug}`} className="cart-item-img">
                  {item.product.thumbnail_url
                    ? <img src={item.product.thumbnail_url} alt={item.product.name} />
                    : <i className="bi bi-cup-hot-fill" style={{ fontSize: 40, color: 'var(--gray-300)' }}></i>
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
                      <i className="bi bi-trash3" style={{ marginRight: 3 }}></i>Remove
                    </button>
                    <button style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                      <i className="bi bi-heart" style={{ marginRight: 3 }}></i>Save
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
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textAlign: 'right' }}>
                      -{item.product.discount_percentage}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Continue shopping */}
          <div style={{ marginTop: 12 }}>
            <Link to="/store" className="btn btn-outline">
              <i className="bi bi-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary">
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
                <span className="summary-label">Discount</span>
                <span className="summary-value discount">
                  - KES {cart.items.reduce((acc, item) => {
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
            <i className="bi bi-lock-fill"></i>
            Proceed to Checkout
          </button>

          <div style={{ marginTop: 12, background: 'white', borderRadius: 8, padding: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
              <i className="bi bi-shield-check" style={{ color: 'var(--success)', marginRight: 5 }}></i>
              Secure Checkout
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="payment-icon" style={{ background: '#006600', color: 'white' }}>M-PESA</span>
              <span className="payment-icon" style={{ background: '#1a1f71', color: 'white' }}>VISA</span>
              <span className="payment-icon" style={{ background: '#eb001b', color: 'white' }}>MC</span>
              <span className="payment-icon" style={{ background: '#555', color: 'white' }}>CASH</span>
            </div>
          </div>

          {subtotal >= 3000 && (
            <div style={{ marginTop: 12, background: 'var(--success-light)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-truck"></i>
              You qualify for FREE delivery on this order!
            </div>
          )}
          {subtotal < 3000 && (
            <div style={{ marginTop: 12, background: 'var(--primary-xlight)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600 }}>
              <i className="bi bi-truck" style={{ marginRight: 5 }}></i>
              Add KES {(3000 - subtotal).toLocaleString()} more for FREE delivery!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}