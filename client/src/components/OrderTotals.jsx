import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../utils/pricing';

/**
 * Receipt-style totals block. Used on the cart, checkout and order pages.
 */
export default function OrderTotals({ itemsTotal, shippingFee, totalPrice, showFreeShippingHint = false, children }) {
  const missing = FREE_SHIPPING_THRESHOLD - itemsTotal;

  return (
    <div className="receipt">
      <div className="receipt-row">
        <span>Items</span>
        <span>{formatPrice(itemsTotal)}</span>
      </div>
      <div className="receipt-row">
        <span>Shipping</span>
        <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
      </div>
      {showFreeShippingHint && missing > 0 && itemsTotal > 0 && (
        <p className="receipt-hint">Add {formatPrice(missing)} more for free shipping.</p>
      )}
      <div className="receipt-row receipt-total">
        <span>Total</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>
      {children}
    </div>
  );
}
