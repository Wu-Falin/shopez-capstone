import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { MAX_QTY_PER_ITEM } from '../utils/pricing';
import QuantityStepper from '../components/QuantityStepper';
import OrderTotals from '../components/OrderTotals';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, totals, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          title="Your cart is empty"
          text="Browse the shop and add something you like."
          action={
            <Link to="/" className="btn btn-primary">
              Go to the shop
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>
      <div className="two-col">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item._id} className="cart-item">
              <img src={item.image} alt="" className="cart-thumb" />
              <div className="cart-item-info">
                <Link to={`/product/${item._id}`} className="cart-item-name">
                  {item.name}
                </Link>
                <span className="muted">{formatPrice(item.price)} each</span>
              </div>
              <QuantityStepper
                value={item.quantity}
                max={Math.min(item.stock ?? MAX_QTY_PER_ITEM, MAX_QTY_PER_ITEM)}
                onChange={(q) => updateQuantity(item._id, q)}
                label={`Quantity of ${item.name}`}
              />
              <strong className="cart-line-total">{formatPrice(item.price * item.quantity)}</strong>
              <button type="button" className="btn btn-link" onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <aside>
          <h2 className="aside-title">Order summary</h2>
          <OrderTotals {...totals} showFreeShippingHint>
            <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
              Go to checkout
            </button>
          </OrderTotals>
        </aside>
      </div>
    </div>
  );
}
