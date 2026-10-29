import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import FormField from '../components/FormField';
import Alert from '../components/Alert';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from || '/'} replace />;

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your name, email and password.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate(from || '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="container page auth-page">
      <form className="panel auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create an account</h1>
        <FormField label="Full name" id="name" value={form.name} onChange={update} autoComplete="name" required />
        <FormField label="Email" id="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
        <FormField
          label="Password"
          id="password"
          type="password"
          value={form.password}
          onChange={update}
          autoComplete="new-password"
          hint="At least 6 characters."
          required
        />
        <FormField
          label="Confirm password"
          id="confirm"
          type="password"
          value={form.confirm}
          onChange={update}
          autoComplete="new-password"
          required
        />
        <Alert type="error">{error}</Alert>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" state={{ from }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
