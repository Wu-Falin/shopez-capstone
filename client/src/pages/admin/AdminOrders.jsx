import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { formatDate, formatPrice, shortId } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';

const STATUSES = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    orderApi
      .all(filter === 'All' ? {} : { status: filter })
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filter]);

  const changeStatus = async (order, status) => {
    setSavingId(order._id);
    setError('');
    try {
      const updated = await orderApi.setStatus(order._id, status);
      setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="section-head">
        <h2>Orders</h2>
        <div className="chips" role="group" aria-label="Filter by status">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${filter === s ? 'is-active' : ''}`}
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <Loader label="Loading orders" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders here" text={filter === 'All' ? 'Orders appear here once customers check out.' : `No ${filter.toLowerCase()} orders.`} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Payment</th>
                <th scope="col">Status</th>
                <th scope="col">Change status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/orders/${o._id}`}>{shortId(o._id)}</Link>
                  </td>
                  <td>
                    {o.user?.name || 'Deleted user'}
                    <br />
                    <small className="muted">{o.user?.email}</small>
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{formatPrice(o.totalPrice)}</td>
                  <td>{o.paymentMethod}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`status-${o._id}`}>
                      Status for order {shortId(o._id)}
                    </label>
                    <select
                      id={`status-${o._id}`}
                      value={o.status}
                      disabled={o.status === 'Cancelled' || savingId === o._id}
                      onChange={(e) => changeStatus(o, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
