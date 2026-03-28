// src/components/ProductCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function StarRating({ rating, count }) {
  return (
    <div className="product-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(s => {
          let cls = 'bi-star star';
          if (s <= Math.floor(rating))     cls = 'bi-star-fill star filled';
          else if (s - 0.5 <= rating)      cls = 'bi-star-half star half';
          return <i key={s} className={`bi ${cls}`}></i>;
        })}
      </div>
      {count > 0 && <span className="rating-count">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToast }  = useToast();
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await addToCart(product.id);
    if (ok) addToast(`${product.name} added to cart!`, 'success');
    else    addToast('Could not add to cart.', 'error');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(w => !w);
  };

  const imgSrc           = product.thumbnail_url;
  const hasDiscount      = product.discount_percentage > 0;
  const badgeStackOffset = hasDiscount ? 32 : 10;

  return (
    <Link to={`/product/${product.slug}`} className="product-card">

      {/* Image area */}
      <div className="product-img-wrap">

        {/* Badges */}
        {hasDiscount && (
          <span className="product-badge badge-discount">
            -{product.discount_percentage}%
          </span>
        )}
        {product.is_new_arrival && !hasDiscount && (
          <span className="product-badge badge-new">New</span>
        )}
        {product.is_best_seller && (
          <span
            className="product-badge badge-hot"
            style={{ top: badgeStackOffset }}
          >
            Hot
          </span>
        )}
        {product.is_featured && !hasDiscount && !product.is_new_arrival && (
          <span className="product-badge badge-featured">Featured</span>
        )}

        {/* Wishlist */}
        <button
          className={`product-wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Product image */}
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="product-img" loading="lazy" />
        ) : (
          <div className="product-img-placeholder">
            <i className="bi bi-cup-hot-fill"></i>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="product-info">
        <div className="product-name">{product.name}</div>

        {product.volume && (
          <span className="product-volume-badge">{product.volume}</span>
        )}

        {(product.average_rating > 0 || product.total_reviews > 0) && (
          <StarRating rating={product.average_rating} count={product.total_reviews} />
        )}

        {/* Price */}
        <div className="product-price-row">
          <div className="price-row-inline">
            <span className="price-current">
              <span className="price-currency">KES </span>
              {Number(product.price).toLocaleString()}
            </span>
            {product.old_price && (
              <span className="price-old">
                KES {Number(product.old_price).toLocaleString()}
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="price-discount">{product.discount_percentage}% off</span>
          )}
        </div>

        {/* Express delivery badge */}
        <div className="express-badge">
          <i className="bi bi-lightning-charge-fill"></i>
          Express Delivery
        </div>
      </div>

    </Link>
  );
}