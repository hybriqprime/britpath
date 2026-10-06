import { useState } from 'react';

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';

export default function ChangePassword({ request }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setDone(false);

    if (next.length < 8) return setError('New password must be at least 8 characters');
    if (next !== confirm) return setError('The new passwords do not match');

    setBusy(true);
    try {
      await request('/auth/password', {
        method: 'PATCH',
        body: { currentPassword: current, newPassword: next },
      });
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer font-display text-lg font-bold text-navy-900">
        Change your password
      </summary>

      <form onSubmit={submit} className="mt-4 max-w-sm space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600">Current password</label>
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">New password</label>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Confirm new password</label>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
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
        {done && <p className="text-sm text-green-700">Password updated.</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-gold-300 hover:bg-navy-800 disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </details>
  );
}