import { NavLink, Outlet } from 'react-router-dom';

/** Shared frame for the admin pages: a title and tabs. */
export default function AdminLayout() {
  return (
    <div className="container page">
      <div className="admin-head">
        <h1>Admin</h1>
        <nav className="tabs" aria-label="Admin sections">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
