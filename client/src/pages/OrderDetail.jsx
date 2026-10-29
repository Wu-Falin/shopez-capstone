import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { orderApi } from '../api/services';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPrice, shortId } from '../utils/format';
import OrderProgress from '../components/OrderProgress';
import OrderTotals from '../components/OrderTotals';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const justPlaced = Boolean(location.state?.justPlaced);

  useEffect(() => {
    orderApi
      .get(id)
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      setOrder(await orderApi.cancel(id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader label="Loading order" />;
  if (!order) {
    return (
      <div className="container page">
        <Alert type="error">{error || 'Order not found'}</Alert>
        <Link to="/orders" className="btn btn-secondary">
          Back to my orders
        </Link>
      </div>
    );
  }

  const isOwner = String(order.user?._id || order.user) === String(user?._id);
  const backTo = isAdmin && !isOwner ? '/admin/orders' : '/orders';

  return (
    <div className="container page">
      <Link to={backTo} className="back-link">
        ← Back to {backTo === '/orders' ? 'my orders' : 'all orders'}
      </Link>

      {justPlaced && (
        <Alert type="success">Thank you! Your order {shortId(order._id)} has been placed.</Alert>
      )}

      <div className="order-head">
        <div>
          <h1>Order {shortId(order._id)}</h1>
          <p className="muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <OrderProgress status={order.status} />
      <Alert type="error">{error}</Alert>

      <div className="two-col">
        <div className="panel">
          <h2>Items</h2>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.product}>
                <img src={item.image} alt="" className="cart-thumb" />
                <span className="order-item-name">{item.name}</span>
                <span className="muted">
                  {item.quantity} × {formatPrice(item.price)}
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>

          <h2>Delivery</h2>
          <address className="address">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.phone}
          </address>
          {isAdmin && order.user?.email && (
            <p className="muted">
              Customer account: {order.user.name} ({order.user.email})
            </p>
          )}
        </div>

        <aside>
          <h2 className="aside-title">Payment</h2>
          <OrderTotals itemsTotal={order.itemsTotal} shippingFee={order.shippingFee} totalPrice={order.totalPrice}>
            <p className="receipt-hint">Paid by: {order.paymentMethod}</p>
            {isOwner && order.status === 'Placed' && (
              <button type="button" className="btn btn-danger btn-block" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
            )}
          </OrderTotals>
        </aside>
      </div>
    </div>
  );
}
