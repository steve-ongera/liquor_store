// src/api/index.js
const BASE_URL = 'http://localhost:8000/api/v1';

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
};

export const api = {
  // Categories
  getCategories: () => request('/categories/'),
  getCategory: (slug) => request(`/categories/${slug}/`),

  // Brands
  getBrands: () => request('/brands/'),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products/?${qs}`);
  },
  getProduct: (slug) => request(`/products/${slug}/`),
  getFeatured: () => request('/products/featured/'),
  getNewArrivals: () => request('/products/new_arrivals/'),
  getBestSellers: () => request('/products/best_sellers/'),
  getDeals: () => request('/products/deals/'),
  getProductsByCategory: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products/by_category/?${qs}`);
  },
  addReview: (slug, data) =>
    request(`/products/${slug}/reviews/`, { method: 'POST', body: JSON.stringify(data) }),

  // Delivery
  getRegions: () => request('/regions/'),
  getPickupStations: (regionId) =>
    regionId ? request(`/pickup-stations/?region=${regionId}`) : request('/pickup-stations/'),
  getDeliveryZones: (regionId) =>
    regionId ? request(`/delivery-zones/?region=${regionId}`) : request('/delivery-zones/'),

  // Cart
  getCart: () => request('/cart/'),
  addToCart: (productId, quantity = 1) =>
    request('/cart/add/', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
  updateCartItem: (itemId, quantity) =>
    request('/cart/update_item/', { method: 'POST', body: JSON.stringify({ item_id: itemId, quantity }) }),
  removeCartItem: (itemId) =>
    request('/cart/remove_item/', { method: 'POST', body: JSON.stringify({ item_id: itemId }) }),
  clearCart: () => request('/cart/clear/', { method: 'POST' }),

  // Orders
  createOrder: (data) =>
    request('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  getOrder: (orderNumber) => request(`/orders/${orderNumber}/`),
};