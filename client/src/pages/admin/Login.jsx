import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

export default function Login() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (ready && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-center text-2xl font-extrabold tracking-tight">
          <span className="text-brit-navy">BRIT</span>
          <span className="text-brit-red">PATH</span>
        </p>
        <p className="mt-1 text-center text-sm text-slate-500">Staff sign in</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-navy-900 px-6 py-3 font-semibold text-gold-300 transition hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          <Link to="/forgot-password" className="underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}