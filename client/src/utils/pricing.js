// These match server/config/constants.js. The server always recalculates the
// real total when the order is placed; this is only for showing it in the cart.
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_FEE = 5;
export const MAX_QTY_PER_ITEM = 10;

export function calcTotals(items) {
  const itemsTotal = Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
  const shippingFee = itemsTotal === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { itemsTotal, shippingFee, totalPrice: Math.round((itemsTotal + shippingFee) * 100) / 100 };
}
