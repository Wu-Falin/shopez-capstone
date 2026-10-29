const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Every order route needs a logged-in user.
router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders); // must come before "/:id"
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelMyOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
