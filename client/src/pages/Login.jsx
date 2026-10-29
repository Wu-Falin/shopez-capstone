import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import FormField from '../components/FormField';
import Alert from '../components/Alert';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from || (user.role === 'admin' ? '/admin' : '/')} replace />;

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const loggedIn = await login(form.email.trim(), form.password);
      navigate(from || (loggedIn.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="container page auth-page">
      <form className="panel auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Log in</h1>
        {from && <p className="muted">Log in to continue.</p>}
        <FormField label="Email" id="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
        <FormField
          label="Password"
          id="password"
          type="password"
          value={form.password}
          onChange={update}
          autoComplete="current-password"
          required
        />
        <Alert type="error">{error}</Alert>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <p className="auth-switch">
          New to ShopEZ?{' '}
          <Link to="/register" state={{ from }}>
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
