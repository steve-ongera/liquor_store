// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function StarRating({ rating, count }) {
  return (
    <div className="product-rating">
      <div className="stars">
        {[1,2,3,4,5].map(s => (
          <i key={s} className={`bi ${
            s <= Math.floor(rating) ? 'bi-star-fill star filled' :
            s - 0.5 <= rating ? 'bi-star-half star half' :
            'bi-star star'
          }`}></i>
        ))}
      </div>
      {count > 0 && <span className="rating-count">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await addToCart(product.id);
    if (ok) addToast(`${product.name} added to cart!`, 'success');
    else addToast('Could not add to cart.', 'error');
  };

  const imgSrc = product.thumbnail_url;

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-img-wrap">
        {product.discount_percentage > 0 && (
          <span className="product-badge badge-discount">-{product.discount_percentage}%</span>
        )}
        {product.is_new_arrival && !product.discount_percentage && (
          <span className="product-badge badge-new">New</span>
        )}
        {product.is_best_seller && (
          <span className="product-badge badge-hot" style={{ top: product.discount_percentage ? 28 : 8 }}>🔥 Hot</span>
        )}
        <button className="product-wishlist-btn" onClick={e => { e.preventDefault(); }}>
          <i className="bi bi-heart"></i>
        </button>
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="product-img" />
        ) : (
          <div className="product-img-placeholder">
            <i className="bi bi-cup-hot-fill"></i>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <span className="product-volume-badge">{product.volume}</span>

        {(product.average_rating > 0 || product.total_reviews > 0) && (
          <StarRating rating={product.average_rating} count={product.total_reviews} />
        )}

        <div className="product-price-row">
          <div className="price-row-inline">
            <span className="price-current">
              <span className="price-currency">KES </span>
              {Number(product.price).toLocaleString()}
            </span>
            {product.old_price && (
              <span className="price-old">KES {Number(product.old_price).toLocaleString()}</span>
            )}
            {product.discount_percentage > 0 && (
              <span className="price-discount">{product.discount_percentage}% off</span>
            )}
          </div>
        </div>

        <div className="express-badge">
          <i className="bi bi-lightning-charge-fill"></i>
          Express Delivery
        </div>
      </div>
    </Link>
  );
}

export { StarRating };