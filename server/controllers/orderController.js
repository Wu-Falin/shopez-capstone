const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  MAX_QTY_PER_ITEM,
} = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const ADDRESS_FIELDS = ['fullName', 'phone', 'address', 'city', 'postalCode'];

// Rounds money to 2 decimals (avoids results like 19.990000000000002).
const roundMoney = (value) => Math.round(value * 100) / 100;

/**
 * Checks the cart sent by the client and merges duplicate lines.
 * Returns [{ productId, quantity }].
 */
function normaliseItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'Your cart is empty');
  }

  const quantities = new Map();
  items.forEach((item) => {
    const productId = String(item.product || item.productId || '');
    const quantity = Number(item.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      throw httpError(400, 'Invalid product in cart');
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw httpError(400, 'Quantity must be a whole number of at least 1');
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  });

  return [...quantities].map(([productId, quantity]) => {
    if (quantity > MAX_QTY_PER_ITEM) {
      throw httpError(400, `You can order at most ${MAX_QTY_PER_ITEM} of one product`);
    }
    return { productId, quantity };
  });
}

/** Checks that every address field is filled in and returns a clean copy. */
function validateAddress(address = {}) {
  const clean = {};
  ADDRESS_FIELDS.forEach((field) => {
    const value = typeof address[field] === 'string' ? address[field].trim() : '';
    if (!value) throw httpError(400, 'Please fill in all shipping address fields');
    clean[field] = value;
  });
  return clean;
}

/** Puts the quantities of an order back into stock (used when an order is cancelled). */
async function restoreStock(items) {
  await Promise.all(
    items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
    )
  );
}

/** True if the logged-in user owns the order or is an admin. */
function canView(order, user) {
  const ownerId = order.user._id ? order.user._id : order.user;
  return user.role === 'admin' || String(ownerId) === String(user._id);
}

/**
 * POST /api/orders   (logged in)
 * Body: {
 *   items: [{ product: "<productId>", quantity: 2 }],
 *   shippingAddress: { fullName, phone, address, city, postalCode },
 *   paymentMethod: "Cash on Delivery" | "Card (demo)"
 * }
 * Prices are always read from the database, never trusted from the client.
 */
const createOrder = asyncHandler(async (req, res) => {
  const items = normaliseItems(req.body.items);
  const shippingAddress = validateAddress(req.body.shippingAddress);
  const { paymentMethod } = req.body;

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw httpError(400, 'Please choose a payment method');
  }

  // Load all products in one query.
  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const missing = items.find((i) => !productById.has(i.productId));
  if (missing) {
    throw httpError(400, 'One of the products in your cart is no longer available');
  }

  // Reserve stock item by item. "stock >= quantity" in the filter means two
  // shoppers can never buy the same last unit. If one item fails, undo the others.
  const reserved = [];
  for (const item of items) {
    const product = productById.get(item.productId);
    const result = await Product.updateOne(
      { _id: product._id, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if (result.modifiedCount === 0) {
      await restoreStock(reserved);
      const fresh = await Product.findById(product._id);
      const left = fresh ? fresh.stock : 0;
      throw httpError(
        400,
        left > 0 ? `Only ${left} left of "${product.name}"` : `"${product.name}" is out of stock`
      );
    }
    reserved.push({ product: product._id, quantity: item.quantity });
  }

  const orderItems = items.map((item) => {
    const product = productById.get(item.productId);
    return {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    };
  });

  const itemsTotal = roundMoney(orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const shippingFee = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  try {
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingFee,
      totalPrice: roundMoney(itemsTotal + shippingFee),
    });
    res.status(201).json(order);
  } catch (error) {
    await restoreStock(reserved); // order not saved, so give the stock back
    throw error;
  }
});

/**
 * GET /api/orders/my   (logged in)
 * The logged-in user's orders, newest first.
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

/**
 * GET /api/orders/:id   (owner or admin)
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw httpError(404, 'Order not found');
  if (!canView(order, req.user)) throw httpError(403, 'You cannot view this order');
  res.json(order);
});

/**
 * PUT /api/orders/:id/cancel   (owner)
 * A customer can cancel an order only while it is still "Placed".
 */
const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (String(order.user) !== String(req.user._id)) {
    throw httpError(403, 'You cannot cancel this order');
  }
  if (order.status !== 'Placed') {
    throw httpError(400, `Order is already ${order.status.toLowerCase()} and cannot be cancelled`);
  }

  order.status = 'Cancelled';
  await order.save();
  await restoreStock(order.items);
  res.json(order);
});

/**
 * GET /api/orders?status=   (admin)
 * All orders, newest first, with the customer's name and email.
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;

  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

/**
 * PUT /api/orders/:id/status   (admin)
 * Body: { status: "Placed" | "Shipped" | "Delivered" | "Cancelled" }
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    throw httpError(400, `Status must be one of: ${ORDER_STATUSES.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  if (order.status === 'Cancelled') {
    throw httpError(400, 'A cancelled order cannot be changed');
  }

  order.status = status;
  await order.save();
  if (status === 'Cancelled') await restoreStock(order.items);

  await order.populate('user', 'name email');
  res.json(order);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
};
