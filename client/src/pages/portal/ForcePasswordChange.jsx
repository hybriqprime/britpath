import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import AuthShell, { authInput, authButton } from '../../components/AuthShell.jsx';

export default function ForcePasswordChange() {
  const { user, logout, request, refresh } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (next.length < 8) return setError('Your new password must be at least 8 characters');
    if (next !== confirm) return setError('The new passwords do not match');
    if (next === current) return setError('Choose a password different from the temporary one');

    setBusy(true);
    try {
      await request('/auth/password', {
        method: 'PATCH',
        body: { currentPassword: current, newPassword: next },
      });
      await refresh(); // unlocks the portal
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const first = (user?.name || '').split(' ')[0];

  return (
    <AuthShell
      title={`Welcome, ${first}`}
      subtitle="Choose your own password to open your portal."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Temporary password</label>
          <input
            type="password"
            autoComplete="current-password"
            className={authInput}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            autoComplete="new-password"
            className={authInput}
            value={next}
            onChange={(e) => setNext(e.target.value)}
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
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={authButton}>
          {busy ? 'Saving...' : 'Save and continue'}
        </button>
      </form>

      <button onClick={logout} className="mt-4 w-full text-center text-xs text-slate-500 underline">
        Log out
      </button>
    </AuthShell>
  );
}