// src/pages/ProductDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { StarRating } from '../components/ProductCard';

function RatingBar({ label, value, max = 100 }) {
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label}★</span>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${value}%` }}></div>
      </div>
      <span className="rating-bar-count">{Math.round(value)}%</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = review.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-avatar">{initials}</div>
        <div>
          <div className="reviewer-name">{review.full_name}</div>
          <div className="stars" style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(s => (
              <i key={s} className={`bi bi-star${s <= review.rating ? '-fill' : ''}`}
                style={{ fontSize: 11, color: s <= review.rating ? '#ffa500' : '#ddd' }}></i>
            ))}
          </div>
        </div>
        {review.is_verified_purchase && (
          <div className="verified-badge" style={{ marginLeft: 8 }}>
            <i className="bi bi-patch-check-fill"></i> Verified Purchase
          </div>
        )}
        <span className="review-date">
          {new Date(review.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      {review.title && <div className="review-title">{review.title}</div>}
      <div className="review-body">{review.body}</div>
      <div className="review-helpful">
        Was this helpful? <button>Yes ({review.helpful_count})</button>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    api.getProduct(slug)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const ok = await addToCart(product.id, qty);
    if (ok) addToast(`${product.name} added to cart!`, 'success');
    else addToast('Failed to add to cart.', 'error');
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.addReview(slug, review);
      addToast('Review submitted!', 'success');
      setShowReviewForm(false);
      const updated = await api.getProduct(slug);
      setProduct(updated);
    } catch {
      addToast('Could not submit review. You may need to log in.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '16px 0' }}>
        <div style={{ background: 'white', borderRadius: 8, padding: 24, display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 8 }}></div>
          <div>
            <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 12 }}></div>
            <div className="skeleton skeleton-title" style={{ height: 28, marginBottom: 16 }}></div>
            <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: 24 }}></div>
            <div className="skeleton" style={{ height: 56, marginBottom: 16 }}></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <i className="bi bi-exclamation-circle" style={{ fontSize: 64, color: 'var(--gray-300)', display: 'block', marginBottom: 16 }}></i>
        <h2 style={{ color: 'var(--gray-600)' }}>Product not found</h2>
        <Link to="/store" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Store</Link>
      </div>
    );
  }

  const allImages = product.images?.length
    ? product.images
    : product.thumbnail_url
      ? [{ image: product.thumbnail_url, alt_text: product.name, is_primary: true }]
      : [];

  const currentImg = allImages[activeImg]?.image || null;

  // Compute rating distribution from reviews
  const ratingDist = [5,4,3,2,1].map(r => {
    const count = product.reviews?.filter(rv => rv.rating === r).length || 0;
    return { r, pct: product.total_reviews > 0 ? (count / product.total_reviews) * 100 : 0 };
  });

  return (
    <div className="container" style={{ paddingBottom: 24 }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <Link to="/store">Store</Link>
        {product.category && (
          <>
            <i className="bi bi-chevron-right"></i>
            <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
        <i className="bi bi-chevron-right"></i>
        <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
      </div>

      {/* Main Detail Card */}
      <div className="product-detail-layout">
        {/* Gallery */}
        <div className="gallery-wrap">
          {allImages.length > 1 && (
            <div className="gallery-thumbs">
              {allImages.map((img, i) => (
                <div key={i} className={`gallery-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img.image} alt={img.alt_text || product.name} />
                </div>
              ))}
            </div>
          )}
          <div className="gallery-main">
            {currentImg ? (
              <img src={currentImg} alt={product.name} />
            ) : (
              <div style={{ fontSize: 120, color: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <i className="bi bi-cup-hot-fill"></i>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="product-info-panel">
          {product.brand && (
            <div className="product-detail-brand">
              <i className="bi bi-patch-check-fill" style={{ marginRight: 4 }}></i>
              {product.brand.name}
            </div>
          )}

          <h1 className="product-detail-name">{product.name}</h1>

          {product.total_reviews > 0 && (
            <div className="product-detail-rating">
              <span className="rating-score">{Number(product.average_rating).toFixed(1)}</span>
              <div className="stars" style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => (
                  <i key={s} className={`bi bi-star${s <= Math.round(product.average_rating) ? '-fill' : ''}`}
                    style={{ fontSize: 14, color: s <= product.average_rating ? '#ffa500' : '#ddd' }}></i>
                ))}
              </div>
              <span className="rating-text">{product.total_reviews} ratings</span>
            </div>
          )}

          {/* Price */}
          <div className="product-detail-price-row">
            <span className="detail-price-current">
              <span style={{ fontSize: 16, fontWeight: 600 }}>KES </span>
              {Number(product.price).toLocaleString()}
            </span>
            {product.old_price && (
              <span className="detail-price-old">KES {Number(product.old_price).toLocaleString()}</span>
            )}
            {product.discount_percentage > 0 && (
              <span className="detail-discount-badge">-{product.discount_percentage}% OFF</span>
            )}
          </div>
          {product.old_price && (
            <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 12 }}>
              <i className="bi bi-piggy-bank-fill" style={{ marginRight: 4 }}></i>
              You save KES {(Number(product.old_price) - Number(product.price)).toLocaleString()}
            </div>
          )}

          {/* Stock status */}
          <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
            <i className={`bi bi-${product.stock > 0 ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
          </div>

          {/* Specs */}
          <div className="product-specs-mini">
            {product.volume && (
              <div className="spec-row">
                <span className="spec-label"><i className="bi bi-cup" style={{ marginRight: 5 }}></i>Volume</span>
                <span className="spec-value">{product.volume}</span>
              </div>
            )}
            {product.alcohol_content && (
              <div className="spec-row">
                <span className="spec-label"><i className="bi bi-droplet-fill" style={{ marginRight: 5 }}></i>ABV</span>
                <span className="spec-value">{product.alcohol_content}%</span>
              </div>
            )}
            {product.brand?.country_of_origin && (
              <div className="spec-row">
                <span className="spec-label"><i className="bi bi-globe" style={{ marginRight: 5 }}></i>Origin</span>
                <span className="spec-value">{product.brand.country_of_origin}</span>
              </div>
            )}
            {product.category && (
              <div className="spec-row">
                <span className="spec-label"><i className="bi bi-tag" style={{ marginRight: 5 }}></i>Category</span>
                <span className="spec-value">{product.category.name}</span>
              </div>
            )}
            {product.sku && (
              <div className="spec-row">
                <span className="spec-label"><i className="bi bi-upc" style={{ marginRight: 5 }}></i>SKU</span>
                <span className="spec-value" style={{ color: 'var(--gray-400)', fontSize: 11 }}>{product.sku}</span>
              </div>
            )}
          </div>

          {/* Qty + CTA */}
          {product.stock > 0 && (
            <>
              <div className="qty-row">
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>QTY:</span>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>
                    <i className="bi bi-dash"></i>
                  </button>
                  <input className="qty-input" type="number" value={qty} min={1} max={product.stock}
                    onChange={e => setQty(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))} />
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <div className="cta-buttons">
                <button className="btn-add-cart" onClick={handleAddToCart} disabled={addingToCart}>
                  <i className="bi bi-bag-plus-fill"></i>
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button className="btn-buy-now" onClick={handleBuyNow}>
                  <i className="bi bi-lightning-charge-fill"></i> Buy Now
                </button>
                <button className="btn-wishlist-lg">
                  <i className="bi bi-heart"></i>
                </button>
              </div>
            </>
          )}

          {/* Delivery info */}
          <div className="delivery-info-box">
            <div className="delivery-info-row">
              <i className="bi bi-geo-alt-fill"></i>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>Pickup Stations</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 12 }}>50+ locations across Kenya — from KES 0</div>
              </div>
            </div>
            <div className="delivery-info-row">
              <i className="bi bi-truck"></i>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>Home Delivery</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 12 }}>Delivered to your doorstep — from KES 200</div>
              </div>
            </div>
            <div className="delivery-info-row">
              <i className="bi bi-arrow-counterclockwise"></i>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>7-Day Returns</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 12 }}>Easy returns if not satisfied</div>
              </div>
            </div>
            <div className="delivery-info-row">
              <i className="bi bi-shield-check-fill"></i>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>100% Genuine</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 12 }}>All products are verified authentic</div>
              </div>
            </div>
          </div>

          {/* Share */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Share:</span>
            {['bi-whatsapp','bi-facebook','bi-twitter-x','bi-link-45deg'].map(ic => (
              <a key={ic} href="#" style={{ width: 30, height: 30, border: '1px solid var(--gray-200)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', fontSize: 15 }}>
                <i className={`bi ${ic}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div style={{ background: 'white', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-file-text-fill" style={{ color: 'var(--primary)' }}></i> Product Description
          </h2>
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 13 }}>{product.description}</p>
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-star-fill" style={{ color: '#ffa500' }}></i> Customer Reviews
          {product.total_reviews > 0 && <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 400 }}>({product.total_reviews})</span>}
        </h2>

        {product.total_reviews > 0 && (
          <div className="reviews-summary">
            <div className="reviews-score-big">
              <div className="score-number">{Number(product.average_rating).toFixed(1)}</div>
              <div className="score-stars">
                <div className="stars" style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {[1,2,3,4,5].map(s => (
                    <i key={s} className={`bi bi-star${s <= product.average_rating ? '-fill' : ''} star`}
                      style={{ fontSize: 16, color: s <= product.average_rating ? '#ffa500' : '#ddd' }}></i>
                  ))}
                </div>
              </div>
              <div className="score-total">{product.total_reviews} reviews</div>
            </div>
            <div className="rating-bars">
              {ratingDist.map(({ r, pct }) => <RatingBar key={r} label={r} value={pct} />)}
            </div>
          </div>
        )}

        {/* Write review */}
        <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => setShowReviewForm(v => !v)}>
          <i className="bi bi-pencil-fill"></i> Write a Review
        </button>

        {showReviewForm && (
          <form onSubmit={submitReview} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Your Review</h3>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(r => (
                  <button key={r} type="button" onClick={() => setReview(rv => ({ ...rv, rating: r }))}>
                    <i className={`bi bi-star${r <= review.rating ? '-fill' : ''}`}
                      style={{ fontSize: 24, color: r <= review.rating ? '#ffa500' : '#ddd' }}></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" placeholder="Summarize your experience" value={review.title} onChange={e => setReview(rv => ({ ...rv, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Review</label>
              <textarea className="form-control" rows={4} placeholder="Share your experience..." value={review.body} onChange={e => setReview(rv => ({ ...rv, body: e.target.value }))} required style={{ resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary"><i className="bi bi-send-fill"></i> Submit</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowReviewForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {product.reviews?.length > 0 ? (
          product.reviews.map(r => <ReviewCard key={r.id} review={r} />)
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)' }}>
            <i className="bi bi-chat-square-text" style={{ fontSize: 40, display: 'block', marginBottom: 8 }}></i>
            No reviews yet. Be the first to review!
          </div>
        )}
      </div>

      {/* Related Products */}
      {product.related_products?.length > 0 && (
        <div className="product-row-section page-section">
          <div className="section-header">
            <h2 className="section-title"><i className="bi bi-grid"></i>Related Products</h2>
            <Link to={`/category/${product.category?.slug}`} className="section-see-all">
              See All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="product-scroll-wrap">
            <div className="products-row">
              {product.related_products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* Recently Reviewed */}
      {product.recently_reviewed?.length > 0 && (
        <div className="product-row-section page-section">
          <div className="section-header">
            <h2 className="section-title"><i className="bi bi-clock-history"></i>Recently Reviewed</h2>
          </div>
          <div className="product-scroll-wrap">
            <div className="products-row">
              {product.recently_reviewed.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}