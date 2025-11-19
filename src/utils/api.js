// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('admin_token') || localStorage.getItem('token');
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (isFormData) {
    config.body = options.body;
    if (config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }
  } else if (
    options.body &&
    typeof options.body === 'object' &&
    !(options.body instanceof ArrayBuffer) &&
    !(typeof Blob !== 'undefined' && options.body instanceof Blob)
  ) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response has content
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, return error
      throw new Error(`Invalid response format: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Re-throw with more info
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please check your connection.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  
  getMe: () => apiRequest('/auth/me'),
 
  requestPasswordReset: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  verifyResetCode: (email, code) =>
    apiRequest('/auth/verify-reset-code', {
      method: 'POST',
      body: {
        email: typeof email === 'string' ? email.trim() : email,
        code: typeof code === 'string' ? code.trim() : code,
      },
    }),

  resetPassword: (email, code, newPassword) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: {
        email: typeof email === 'string' ? email.trim() : email,
        code: typeof code === 'string' ? code.trim() : code,
        newPassword,
      },
    }),

  adminResetPassword: (email, newPassword) =>
    apiRequest('/auth/admin/reset-password', {
      method: 'POST',
      body: {
        email: typeof email === 'string' ? email.trim().toLowerCase() : email,
        newPassword,
      },
    }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },
  
  getById: (id) => apiRequest(`/products/${id}`),
  
  getBestSellers: () => apiRequest('/products/bestsellers'),
  
  getFeatured: () => apiRequest('/products/featured'),
  
  search: (query) => apiRequest(`/products/search?q=${encodeURIComponent(query)}`),
  
  getByCategory: (category) => apiRequest(`/products/category/${category}`),
  
  getRelated: (id) => apiRequest(`/products/${id}/related`),

  create: (productData) => apiRequest('/products', {
    method: 'POST',
    body: productData,
  }),

  updatePrice: (id, priceData) => apiRequest(`/products/${id}/price`, {
    method: 'PUT',
    body: priceData,
  }),
};

export const adminAPI = {
  login: (credentials) =>
    apiRequest('/auth/admin/login', {
      method: 'POST',
      body: credentials,
    }),

  getDashboardMetrics: () => apiRequest('/admin/metrics'),
  getNotifications: () => apiRequest('/admin/notifications'),
  markNotificationRead: (notificationId) =>
    apiRequest(`/admin/notifications/${notificationId}/read`, {
      method: 'POST',
    }),
  clearNotifications: () =>
    apiRequest('/admin/notifications/clear', {
      method: 'POST',
    }),

  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  createProduct: (productData) =>
    apiRequest('/products', {
      method: 'POST',
      body: productData,
    }),

  updateProduct: (id, productData) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    }),

  deleteProduct: (id) =>
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),

  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/orders?${queryString}`);
  },

  updateOrderStatus: (orderId, payload) =>
    apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: payload,
    }),

  getOrderById: (orderId) => apiRequest(`/admin/orders/${orderId}`),

  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${queryString}`);
  },

  updateUser: (userId, payload) =>
    apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: payload,
    }),

  getUserOrders: (userId) => apiRequest(`/admin/users/${userId}/orders`),
};

export const profileAPI = {
  update: (payload) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: payload,
    }),
};

// Cart API
export const cartAPI = {
  get: () => apiRequest('/cart'),
  
  add: (productId, quantity = 1) => apiRequest('/cart', {
    method: 'POST',
    body: { productId, quantity },
  }),
  
  update: (productId, quantity) => apiRequest(`/cart/${productId}`, {
    method: 'PUT',
    body: { quantity },
  }),
  
  remove: (productId) => apiRequest(`/cart/${productId}`, {
    method: 'DELETE',
  }),
  
  clear: () => apiRequest('/cart', {
    method: 'DELETE',
  }),
};

// Wishlist API
export const wishlistAPI = {
  get: () => apiRequest('/wishlist'),
  
  add: (productId) => apiRequest('/wishlist', {
    method: 'POST',
    body: { productId },
  }),
  
  remove: (productId) => apiRequest(`/wishlist/${productId}`, {
    method: 'DELETE',
  }),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: orderData,
  }),
  
  getAll: () => apiRequest('/orders'),
  
  getById: (id) => apiRequest(`/orders/${id}`),
  
  track: (orderNumber) => apiRequest(`/orders/track/${orderNumber}`),
};

export const shippingAPI = {
  get: () => apiRequest('/shipping'),

  update: (amount) =>
    apiRequest('/shipping', {
      method: 'PUT',
      body: { amount },
    }),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => apiRequest('/reviews'),
  
  getByProduct: (productId) => apiRequest(`/reviews/product/${productId}`),
  
  create: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: reviewData,
  }),

  update: (reviewId, reviewData) =>
    apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: reviewData,
    }),

  remove: (reviewId) =>
    apiRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email) => apiRequest('/newsletter', {
    method: 'POST',
    body: { email },
  }),
};

// Contact API
export const contactAPI = {
  submit: (formData) => apiRequest('/contact', {
    method: 'POST',
    body: formData,
  }),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/uploads/image', {
      method: 'POST',
      body: formData,
    });
  },
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/uploads/profile-image', {
      method: 'POST',
      body: formData,
    });
  },
};

export default {
  authAPI,
  productsAPI,
  cartAPI,
  wishlistAPI,
  ordersAPI,
  shippingAPI,
  reviewsAPI,
  newsletterAPI,
  contactAPI,
  uploadAPI,
};
