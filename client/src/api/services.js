import api from './client';

/**
 * Every call to the backend lives here, grouped by feature.
 * Pages import these functions instead of writing URLs themselves.
 * Each function returns the response data directly.
 */
const data = (request) => request.then((res) => res.data);

export const authApi = {
  register: (name, email, password) => data(api.post('/auth/register', { name, email, password })),
  login: (email, password) => data(api.post('/auth/login', { email, password })),
  me: () => data(api.get('/auth/me')),
};

export const productApi = {
  list: (params = {}) => data(api.get('/products', { params })),
  categories: () => data(api.get('/products/categories')),
  get: (id) => data(api.get(`/products/${id}`)),
  create: (product) => data(api.post('/products', product)),
  update: (id, product) => data(api.put(`/products/${id}`, product)),
  remove: (id) => data(api.delete(`/products/${id}`)),
};

export const orderApi = {
  create: (order) => data(api.post('/orders', order)),
  mine: () => data(api.get('/orders/my')),
  get: (id) => data(api.get(`/orders/${id}`)),
  cancel: (id) => data(api.put(`/orders/${id}/cancel`)),
  all: (params = {}) => data(api.get('/orders', { params })),
  setStatus: (id, status) => data(api.put(`/orders/${id}/status`, { status })),
};

export const adminApi = {
  stats: () => data(api.get('/admin/stats')),
};
