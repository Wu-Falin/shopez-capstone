import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/services';
import { getErrorMessage } from '../api/client';
import { formatDate, formatPrice, shortId } from '../utils/format';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderApi
      .mine()
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your orders" />;

  return (
    <div className="container page">
      <h1>My orders</h1>
      <Alert type="error">{error}</Alert>

      {orders.length === 0 && !error ? (
        <EmptyState
          title="No orders yet"
          text="When you place an order, it will show up here so you can follow it."
          action={
            <Link to="/" className="btn btn-primary">
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Date</th>
                <th scope="col">Items</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{shortId(order._id)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    <Link to={`/orders/${order._id}`}>View details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
