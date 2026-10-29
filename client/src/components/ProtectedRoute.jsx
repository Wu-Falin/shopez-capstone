import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Wraps routes that need a logged-in user (or an admin when adminOnly is set).
 * Guests are sent to the login page and brought back afterwards.
 */
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, isAdmin, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Loader label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
