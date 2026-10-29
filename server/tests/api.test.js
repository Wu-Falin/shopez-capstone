/**
 * End-to-end API tests for ShopEZ (Node's built-in test runner, no extra packages).
 *
 * How to run:
 *   1. npm run seed        (loads sample products and the demo accounts)
 *   2. npm start           (in one terminal)
 *   3. npm test            (in another terminal, inside server/)
 *
 * The tests create one new customer and one order, then cancel that order,
 * so product stock ends up where it started.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;

async function api(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const state = {};

test('API is running', async () => {
  const { status, data } = await api('GET', '/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
});

test('products can be listed, searched and filtered', async () => {
  const all = await api('GET', '/products');
  assert.equal(all.status, 200);
  assert.ok(all.data.length >= 1, 'run "npm run seed" first');

  const search = await api('GET', '/products?search=mug');
  assert.ok(search.data.every((p) => /mug/i.test(p.name)));

  const books = await api('GET', '/products?category=Books');
  assert.ok(books.data.every((p) => p.category === 'Books'));

  state.product = all.data.find((p) => p.stock >= 2);
  assert.ok(state.product, 'need a product with at least 2 in stock');
});

test('unknown product id returns 404', async () => {
  const { status } = await api('GET', '/products/123');
  assert.equal(status, 404);
});

test('a new customer can register and log in', async () => {
  const email = `test${Date.now()}@shopez.com`;
  const reg = await api('POST', '/auth/register', { body: { name: 'Test User', email, password: 'secret123' } });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.role, 'customer');
  assert.equal(reg.data.user.password, undefined);

  const again = await api('POST', '/auth/register', { body: { name: 'Test User', email, password: 'secret123' } });
  assert.equal(again.status, 400);

  const wrong = await api('POST', '/auth/login', { body: { email, password: 'wrong-password' } });
  assert.equal(wrong.status, 401);

  const login = await api('POST', '/auth/login', { body: { email, password: 'secret123' } });
  assert.equal(login.status, 200);
  state.token = login.data.token;

  const me = await api('GET', '/auth/me', { token: state.token });
  assert.equal(me.data.email, email);
});

test('protected routes need a token, admin routes need an admin', async () => {
  assert.equal((await api('GET', '/orders/my')).status, 401);
  assert.equal((await api('GET', '/admin/stats', { token: state.token })).status, 403);
  assert.equal((await api('POST', '/products', { token: state.token, body: { name: 'x' } })).status, 403);
});

test('customer places an order; prices come from the server', async () => {
  const before = (await api('GET', `/products/${state.product._id}`)).data.stock;
  const { status, data } = await api('POST', '/orders', {
    token: state.token,
    body: {
      items: [{ product: state.product._id, quantity: 2, price: 0.01 }],
      shippingAddress: { fullName: 'Test User', phone: '0812345678', address: 'Test St 1', city: 'Test City', postalCode: '12345' },
      paymentMethod: 'Cash on Delivery',
    },
  });
  assert.equal(status, 201);
  assert.equal(data.items[0].price, state.product.price, 'price must not be taken from the request');
  assert.equal(data.status, 'Placed');
  const after = (await api('GET', `/products/${state.product._id}`)).data.stock;
  assert.equal(after, before - 2);
  state.order = data;
  state.stockBefore = before;
});

test('order with missing address is rejected', async () => {
  const { status } = await api('POST', '/orders', {
    token: state.token,
    body: { items: [{ product: state.product._id, quantity: 1 }], shippingAddress: {}, paymentMethod: 'Cash on Delivery' },
  });
  assert.equal(status, 400);
});

test('customer sees the order in "my orders"', async () => {
  const { data } = await api('GET', '/orders/my', { token: state.token });
  assert.ok(data.some((o) => o._id === state.order._id));
});

test('admin sees dashboard numbers and can change the order status', async () => {
  const login = await api('POST', '/auth/login', { body: { email: 'admin@shopez.com', password: 'Admin@123' } });
  assert.equal(login.status, 200, 'demo admin missing: run "npm run seed"');
  state.adminToken = login.data.token;

  const stats = await api('GET', '/admin/stats', { token: state.adminToken });
  assert.equal(stats.status, 200);
  assert.ok(stats.data.orders >= 1);

  const shipped = await api('PUT', `/orders/${state.order._id}/status`, { token: state.adminToken, body: { status: 'Shipped' } });
  assert.equal(shipped.data.status, 'Shipped');

  // A shipped order can no longer be cancelled by the customer.
  const cancel = await api('PUT', `/orders/${state.order._id}/cancel`, { token: state.token });
  assert.equal(cancel.status, 400);
});

test('admin cancels the order and the stock comes back', async () => {
  const res = await api('PUT', `/orders/${state.order._id}/status`, { token: state.adminToken, body: { status: 'Cancelled' } });
  assert.equal(res.data.status, 'Cancelled');
  const stock = (await api('GET', `/products/${state.product._id}`)).data.stock;
  assert.equal(stock, state.stockBefore);
});
