import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { STAGE_LABEL } from '../../lib/leadMeta.js';
import { credentialsMessage, waLinkText } from '../../lib/journeyMeta.js';

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';

export default function ConvertLeadModal({ onClose, onCreated }) {
  const { request } = useAuth();
  const [leads, setLeads] = useState([]);
  const [leadId, setLeadId] = useState('');
  const [email, setEmail] = useState('');
  const [pkg, setPkg] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    request('/leads?limit=100')
      .then((d) => setLeads(d.leads.filter((l) => l.status !== 'lost')))
      .catch((e) => setError(e.message));
  }, [request]);

  function pick(id) {
    setLeadId(id);
    const lead = leads.find((l) => l._id === id);
    setEmail(lead?.email || '');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!leadId) return setError('Choose a lead first');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');

    setBusy(true);
    try {
      const d = await request('/clients', {
        method: 'POST',
        body: { leadId, email: email.trim(), package: pkg.trim() },
      });
      setResult({ client: d.client, password: d.temporaryPassword });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const message = result
    ? credentialsMessage({
        name: result.client.user.name,
        email: result.client.user.email,
        password: result.password,
      })
    : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy. Select and copy the message manually.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy-900">
            {result ? 'Client account created' : 'Convert a lead to a client'}
          </h2>
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800">
            Close
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!result ? (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Lead</label>
              <select className={inputClass} value={leadId} onChange={(e) => pick(e.target.value)}>
                <option value="">Select a lead</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({STAGE_LABEL[l.status] || l.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Client login email
              </label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
              <p className="mt-1 text-xs text-slate-500">
                Their portal username. Pre-filled from the lead when available.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Package</label>
              <input
                className={inputClass}
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
                placeholder="e.g. Full A-Z guidance"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-navy-900 px-6 py-3 font-semibold text-gold-300 hover:bg-navy-800 disabled:opacity-60"
            >
              {busy ? 'Creating...' : 'Create client account'}
            </button>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600">
              The temporary password is shown <strong>only once</strong>. Send it to the client now.
            </p>

            <pre className="whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-slate-800">
              {message}
            </pre>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={copy}
                className="rounded-full border border-navy-900 px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-100"
              >
                {copied ? 'Copied' : 'Copy message'}
              </button>
              <a
                href={waLinkText(result.client.user.phone, message)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
              >
                Send on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}