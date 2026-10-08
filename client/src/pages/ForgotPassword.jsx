import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AuthShell, { authInput, authButton } from '../components/AuthShell.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="We will email you a link to choose a new one.">
      {sent ? (
        <p className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800">
          If that email has an account, a reset link is on its way. It works for 60 minutes. Check
          your spam folder if you do not see it.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className={authInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className={authButton}>
            {busy ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-slate-500">
        <Link to="/portal/login" className="underline">
          Client sign in
        </Link>
        {' · '}
        <Link to="/admin/login" className="underline">
          Staff sign in
        </Link>
      </p>
    </AuthShell>
  );
}