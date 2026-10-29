const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ORDER_STATUSES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');

const LOW_STOCK_LIMIT = 5;

/**
 * GET /api/admin/stats   (admin)
 * Numbers for the admin dashboard.
 */
const getStats = asyncHandler(async (req, res) => {
  const [customers, products, orders, revenueResult, statusResult, lowStock, recentOrders] =
    await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      // Revenue = total of every order that was not cancelled.
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.find({ stock: { $lte: LOW_STOCK_LIMIT } })
        .select('name stock')
        .sort({ stock: 1 })
        .limit(5),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

  // Make sure every status appears, even with a count of 0.
  const ordersByStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  statusResult.forEach((row) => {
    ordersByStatus[row._id] = row.count;
  });

  res.json({
    customers,
    products,
    orders,
    revenue: Math.round((revenueResult[0]?.total || 0) * 100) / 100,
    ordersByStatus,
    lowStock,
    recentOrders,
  });
});

module.exports = { getStats };
