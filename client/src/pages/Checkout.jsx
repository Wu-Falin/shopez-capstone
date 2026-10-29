import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/services';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import FormField from '../components/FormField';
import OrderTotals from '../components/OrderTotals';
import Alert from '../components/Alert';

const PAYMENT_OPTIONS = [
  { value: 'Cash on Delivery', text: 'Pay in cash when the parcel arrives.' },
  { value: 'Card (demo)', text: 'Demo only. No card details are collected and nothing is charged.' },
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  if (items.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const update = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Object.values(address).some((v) => !v.trim())) {
      setError('Please fill in every address field.');
      return;
    }
    if (!/^[0-9+\-\s]{6,20}$/.test(address.phone.trim())) {
      setError('Please enter a valid phone number (digits, spaces, + or -).');
      return;
    }

    setPlacing(true);
    try {
      const order = await orderApi.create({
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      setError(getErrorMessage(err));
      setPlacing(false);
    }
  };

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <form className="two-col" onSubmit={handleSubmit} noValidate>
        <div className="panel">
          <h2>Shipping address</h2>
          <div className="form-grid">
            <FormField label="Full name" id="fullName" value={address.fullName} onChange={update} autoComplete="name" required />
            <FormField label="Phone" id="phone" type="tel" value={address.phone} onChange={update} autoComplete="tel" required />
            <div className="span-2">
              <FormField
                label="Street address"
                id="address"
                value={address.address}
                onChange={update}
                autoComplete="street-address"
                required
              />
            </div>
            <FormField label="City" id="city" value={address.city} onChange={update} autoComplete="address-level2" required />
            <FormField
              label="Postal code"
              id="postalCode"
              value={address.postalCode}
              onChange={update}
              autoComplete="postal-code"
              required
            />
          </div>

          <h2>Payment</h2>
          <fieldset className="radio-group">
            <legend className="sr-only">Payment method</legend>
            {PAYMENT_OPTIONS.map((option) => (
              <label key={option.value} className={`radio-card ${paymentMethod === option.value ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                />
                <span>
                  <strong>{option.value}</strong>
                  <small>{option.text}</small>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <aside>
          <h2 className="aside-title">Your order</h2>
          <ul className="mini-list">
            {items.map((i) => (
              <li key={i._id}>
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals {...totals}>
            <Alert type="error">{error}</Alert>
            <button type="submit" className="btn btn-primary btn-block" disabled={placing}>
              {placing ? 'Placing order…' : `Place order for ${formatPrice(totals.totalPrice)}`}
            </button>
          </OrderTotals>
        </aside>
      </form>
    </div>
  );
}
