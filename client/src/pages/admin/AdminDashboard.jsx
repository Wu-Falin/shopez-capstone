import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { formatDate, formatPrice, shortId } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!stats) return <Loader label="Loading dashboard" />;

  const tiles = [
    { label: 'Revenue', value: formatPrice(stats.revenue), note: 'from orders that were not cancelled' },
    { label: 'Orders', value: stats.orders, note: `${stats.ordersByStatus.Placed} waiting to ship` },
    { label: 'Customers', value: stats.customers, note: 'registered accounts' },
    { label: 'Products', value: stats.products, note: `${stats.lowStock.length} low on stock` },
  ];

  return (
    <div className="dashboard">
      <div className="stat-row">
        {tiles.map((t) => (
          <div key={t.label} className="stat">
            <span className="stat-label">{t.label}</span>
            <strong className="stat-value">{t.value}</strong>
            <span className="stat-note">{t.note}</span>
          </div>
        ))}
      </div>

      <div className="two-col two-col-even">
        <section className="panel">
          <h2>Orders by status</h2>
          <ul className="status-list">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <li key={status}>
                <StatusBadge status={status} />
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Low stock (5 or fewer)</h2>
          {stats.lowStock.length === 0 ? (
            <p className="muted">All products are well stocked.</p>
          ) : (
            <ul className="status-list">
              {stats.lowStock.map((p) => (
                <li key={p._id}>
                  <span>{p.name}</span>
                  <strong className={p.stock === 0 ? 'stock-out' : 'stock-low'}>{p.stock} left</strong>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/products">Manage products</Link>
        </section>
      </div>

      <section className="panel">
        <h2>Latest orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <Link to={`/orders/${o._id}`}>{shortId(o._id)}</Link>
                    </td>
                    <td>{o.user?.name || 'Deleted user'}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{formatPrice(o.totalPrice)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
