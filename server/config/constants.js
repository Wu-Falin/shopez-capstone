/**
 * Shared values used by models, controllers and the seed script.
 * Keeping them in one place means a change here updates the whole API.
 */
module.exports = {
  CATEGORIES: ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Accessories'],

  ORDER_STATUSES: ['Placed', 'Shipped', 'Delivered', 'Cancelled'],

  PAYMENT_METHODS: ['Cash on Delivery', 'Card (demo)'],

  // Orders at or above this amount ship for free; below it a flat fee is added.
  FREE_SHIPPING_THRESHOLD: 50,
  SHIPPING_FEE: 5,

  // Maximum quantity of one product in a single order line.
  MAX_QTY_PER_ITEM: 10,
};
