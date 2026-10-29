import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close} aria-label="ShopEZ home">
          <Logo />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>

        <nav id="main-menu" className={`nav-links ${open ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={close}>
            Shop
          </NavLink>
          {user && (
            <NavLink to="/orders" onClick={close}>
              My orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={close}>
              Admin
            </NavLink>
          )}
          <NavLink to="/cart" className="cart-link" onClick={close}>
            Cart
            <span className="cart-count" aria-label={`${count} items in cart`}>
              {count}
            </span>
          </NavLink>
          {user ? (
            <div className="nav-user">
              <span className="nav-hello">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <NavLink to="/login" onClick={close}>
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
