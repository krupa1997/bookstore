/**
 * Centralized API client.
 * Base URL is /v1 — Vite dev proxy forwards it to http://localhost:8080/v1.
 * In production, set VITE_API_BASE_URL to the full backend origin.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '') + '/v1';

/** Retrieve the stored JWT (set by AuthContext on login/register). */
function getToken() {
  return localStorage.getItem('bw_token');
}

/**
 * Core fetch wrapper.
 * @param {string} path   — relative path, e.g. "/catalog/products"
 * @param {RequestInit} options
 */
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? body.error ?? message;
    } catch (_) { /* non-JSON error body */ }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  // 204 No Content — return null
  if (res.status === 204) return null;

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (firstName, lastName, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),
};

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const catalogApi = {
  /** @param {{ categoryId?, brandId?, search?, page?, limit? }} params */
  getProducts: ({ categoryId, brandId, search, page = 1, limit = 20 } = {}) => {
    const q = new URLSearchParams();
    if (categoryId) q.set('categoryId', categoryId);
    if (brandId)    q.set('brandId', brandId);
    if (search)     q.set('search', search);
    q.set('page', page);
    q.set('limit', limit);
    return request(`/catalog/products?${q}`);
  },

  getProductById: (productId, postalCode) => {
    const q = postalCode ? `?postalCode=${encodeURIComponent(postalCode)}` : '';
    return request(`/catalog/products/${productId}${q}`);
  },

  getRelatedProducts: (productId) =>
    request(`/catalog/products/${productId}/related`),

  getCategories: () =>
    request('/catalog/categories'),

  getBrands: () =>
    request('/catalog/brands'),

  getRecommendations: () =>
    request('/catalog/recommendations'),
};

// ─── Shipping ────────────────────────────────────────────────────────────────

export const shippingApi = {
  calculateRate: (deliveryPostalCode, cartId) =>
    request('/shipping/calculate-rate', {
      method: 'POST',
      body: JSON.stringify({ deliveryPostalCode, cartId }),
    }),
};

// ─── Cart ────────────────────────────────────────────────────────────────────

export const cartApi = {
  getCart: (guestToken) =>
    request('/cart', {
      headers: guestToken ? { 'X-Guest-Cart-Token': guestToken } : {},
    }),

  addToCart: (productId, quantity = 1, guestToken) =>
    request('/cart', {
      method: 'POST',
      headers: guestToken ? { 'X-Guest-Cart-Token': guestToken } : {},
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (itemId, quantity, guestToken) =>
    request(`/cart/items/${itemId}`, {
      method: 'PUT',
      headers: guestToken ? { 'X-Guest-Cart-Token': guestToken } : {},
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId, guestToken) =>
    request(`/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: guestToken ? { 'X-Guest-Cart-Token': guestToken } : {},
    }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orderApi = {
  checkout: (deliveryAddressId, shippingMethodId = 'standard', redeemGiftPoints = 0) =>
    request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ deliveryAddressId, shippingMethodId, redeemGiftPoints }),
    }),

  getHistory: (page = 1, limit = 10) =>
    request(`/orders?page=${page}&limit=${limit}`),

  getById: (orderId) =>
    request(`/orders/${orderId}`),

  cancel: (orderId, reason) =>
    request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  buyAgain: (orderId) =>
    request(`/orders/${orderId}/buy-again`, { method: 'POST' }),

  requestReturn: (orderId, reason, itemIds = []) =>
    request(`/orders/${orderId}/returns`, {
      method: 'POST',
      body: JSON.stringify({ reason, itemIds }),
    }),
};

// ─── Addresses ───────────────────────────────────────────────────────────────

export const addressApi = {
  getAll: () =>
    request('/members/me/addresses'),

  add: (street, city, state, postalCode, country, isDefault = false) =>
    request('/members/me/addresses', {
      method: 'POST',
      body: JSON.stringify({ street, city, state, postalCode, country, isDefault }),
    }),
};

// ─── Payments & Wallet ───────────────────────────────────────────────────────

export const paymentApi = {
  getWallet: () =>
    request('/payments/wallet'),

  redeemPoints: (pointsToRedeem) =>
    request('/payments/wallet/redeem-points', {
      method: 'POST',
      body: JSON.stringify({ pointsToRedeem }),
    }),

  initiatePayment: (orderId, paymentMethod, walletRedemptionAmount = 0) =>
    request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentMethod, walletRedemptionAmount }),
    }),

  confirmPayment: (paymentId, gatewayTransactionId, status = 'SUCCESS') =>
    request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId, gatewayTransactionId, status }),
    }),
};
