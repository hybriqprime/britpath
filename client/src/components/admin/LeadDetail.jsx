import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { STAGES, STAGE_LABEL, SERVICE_LABEL, waLink } from '../../lib/leadMeta.js';

const FIELDS = [
  ['name', 'Full name'],
  ['phone', 'Phone / WhatsApp'],
  ['email', 'Email'],
  ['course', 'Course'],
  ['level', 'Level'],
  ['intake', 'Intake'],
  ['budget', 'Budget'],
  ['currentStatus', 'Current status'],
];

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';

export default function LeadDetail({ leadId, onClose, onChanged, onDeleted }) {
  const { request } = useAuth();
  const [lead, setLead] = useState(null);
  const [draft, setDraft] = useState({});
  const [tags, setTags] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function hydrate(l) {
    setLead(l);
    setDraft(Object.fromEntries(FIELDS.map(([k]) => [k, l[k] || ''])));
    setTags((l.tags || []).join(', '));
  }

  useEffect(() => {
    let cancelled = false;
    setLead(null);
    setError('');
    setSaved(false);

    request(`/leads/${leadId}`)
      .then((d) => {
        if (!cancelled) hydrate(d.lead);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, request]);

  async function save() {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const body = {
        ...draft,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const d = await request(`/leads/${leadId}`, { method: 'PATCH', body });
      hydrate(d.lead);
      onChanged(d.lead);
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status) {
    if (!lead || status === lead.status) return;
    const body = { status };

    if (status === 'lost') {
      const reason = window.prompt(
        'Why was this lead lost? (e.g. budget, went elsewhere, no response)'
      );
      if (reason === null) return;
      body.lostReason = reason.trim().slice(0, 120);
    }

    setBusy(true);
    setError('');
    try {
      const d = await request(`/leads/${leadId}`, { method: 'PATCH', body });
      hydrate(d.lead);
      onChanged(d.lead);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    setError('');
    try {
      const d = await request(`/leads/${leadId}/notes`, {
        method: 'POST',
        body: { text: note.trim() },
      });
      hydrate(d.lead);
      onChanged(d.lead);
      setNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this lead permanently? This cannot be undone.')) return;
    setBusy(true);
    try {
      await request(`/leads/${leadId}`, { method: 'DELETE' });
      onDeleted(leadId);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />

      <aside className="relative h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <h2 className="font-display text-lg font-bold text-navy-900">
            {lead ? lead.name : 'Lead'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {!lead && !error && <p className="p-6 text-slate-500">Loading...</p>}

        {error && (
          <p className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {lead && (
          <div className="space-y-6 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={waLink(lead.phone, lead.name)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
              >
                Message on WhatsApp
              </a>
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Stage
                </label>
                <select
                  className={inputClass}
                  value={lead.status}
                  disabled={busy}
                  onChange={(e) => changeStatus(e.target.value)}
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {lead.status === 'lost' && lead.lostReason && (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                Lost reason: {lead.lostReason}
              </p>
            )}

            <section className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <p>
                <span className="font-medium text-slate-600">Services needed: </span>
                {lead.services?.length
                  ? lead.services.map((s) => SERVICE_LABEL[s] || s).join(', ')
                  : 'Not specified'}
              </p>
              <p>
                <span className="font-medium text-slate-600">Previous visa refusal: </span>
                {lead.visaRefusal ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="font-medium text-slate-600">Travelled to UK before: </span>
                {lead.ukTravelBefore ? 'Yes' : 'No'}
              </p>
              {lead.message && (
                <p>
                  <span className="font-medium text-slate-600">Message: </span>
                  {lead.message}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Source: {lead.source} · Received {new Date(lead.createdAt).toLocaleString()}
                {lead.consentAt && ` · Consent given ${new Date(lead.consentAt).toLocaleDateString()}`}
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-navy-900">Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {FIELDS.map(([key, label]) => (
                  <div key={key} className={key === 'currentStatus' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-slate-600">{label}</label>
                    <input
                      className={inputClass}
                      value={draft[key] ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">
                    Tags (comma separated)
                  </label>
                  <input
                    className={inputClass}
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="sept-intake, study"
                  />
                </div>
              </div>

              <button
                onClick={save}
                disabled={busy}
                className="mt-3 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-gold-300 hover:bg-navy-800 disabled:opacity-60"
              >
                {busy ? 'Saving...' : 'Save changes'}
              </button>
              {saved && <span className="ml-3 text-sm text-green-700">Saved</span>}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-navy-900">Notes</h3>
              <form onSubmit={addNote} className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="e.g. Sent consultation link"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={busy || !note.trim()}
                  className="mt-1 rounded-lg bg-gold-500 px-4 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-50"
                >
                  Add
                </button>
              </form>

              <ul className="mt-3 space-y-2">
                {[...(lead.notes || [])].reverse().map((n) => (
                  <li key={n._id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="text-slate-800">{n.text}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {n.authorName || 'Staff'} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
                {!lead.notes?.length && <li className="text-sm text-slate-400">No notes yet.</li>}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-navy-900">Stage history</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {[...(lead.statusHistory || [])].reverse().map((h, i) => (
                  <li key={i}>
                    {STAGE_LABEL[h.status] || h.status}
                    <span className="text-xs text-slate-400">
                      {' '}
                      · {new Date(h.at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <button
              onClick={remove}
              disabled={busy}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              Delete this lead
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}