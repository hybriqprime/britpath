import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import AuthShell, { authInput, authButton } from '../components/AuthShell.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) return setError('Your password must be at least 8 characters');
    if (password !== confirm) return setError('The passwords do not match');

    setBusy(true);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthShell title="Link not valid">
        <p className="text-center text-sm text-slate-600">
          This reset link is incomplete.{' '}
          <Link to="/forgot-password" className="underline">
            Request a new one
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
        <div className="flex flex-col gap-2">
          <Link to="/portal/login" className={`${authButton} text-center`}>
            Client sign in
          </Link>
          <Link to="/admin/login" className="text-center text-xs text-slate-500 underline">
            Staff sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            autoComplete="new-password"
            className={authInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
          <input
            type="password"
            autoComplete="new-password"
            className={authInput}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}{' '}
            {error.includes('expired') && (
              <Link to="/forgot-password" className="underline">
                Request a new link
              </Link>
            )}
          </p>
        )}

        <button type="submit" disabled={busy} className={authButton}>
          {busy ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}