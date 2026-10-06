import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import AdminHeader from '../../components/admin/AdminHeader.jsx';
import {
  JOURNEY,
  DOC_STATUS,
  DOC_LABEL_SUGGESTIONS,
  formatBytes,
  formatDate,
  openSignedUrl,
  waLinkText,
  credentialsMessage,
} from '../../lib/journeyMeta.js';

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const h2 = 'font-display text-lg font-bold text-navy-900';

export default function ClientDetail() {
  const { id } = useParams();
  const { request } = useAuth();

  const [client, setClient] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [creds, setCreds] = useState(null);

  const [newItem, setNewItem] = useState({ stage: 'school_admission', title: '', dueDate: '' });
  const [note, setNote] = useState({ text: '', visibleToClient: true });
  const [upload, setUpload] = useState({ label: '', stage: '' });
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  function hydrate(c) {
    setClient(c);
    setForm({
      package: c.package,
      course: c.course,
      university: c.university,
      intake: c.intake,
      currentStage: c.currentStage,
    });
  }

  useEffect(() => {
    let cancelled = false;
    request(`/clients/${id}`)
      .then((d) => {
        if (!cancelled) hydrate(d.client);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, request]);

  // Runs an API action and applies the returned client
  async function run(fn, { reset = false } = {}) {
    setBusy(true);
    setError('');
    try {
      const d = await fn();
      if (d?.client) {
        if (reset) hydrate(d.client);
        else setClient(d.client);
      }
      return d;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile() {
    setSaved(false);
    const d = await run(() => request(`/clients/${id}`, { method: 'PATCH', body: form }), {
      reset: true,
    });
    if (d) setSaved(true);
  }

  const toggleActive = () =>
    run(() =>
      request(`/clients/${id}`, { method: 'PATCH', body: { isActive: !client.user.isActive } })
    );

  async function resetPassword() {
    if (!window.confirm('Generate a new temporary password for this client?')) return;
    const d = await run(() =>
      request(`/clients/${id}/reset-password`, { method: 'POST', body: {} })
    );
    if (d?.temporaryPassword) setCreds(d.temporaryPassword);
  }

  const toggleItem = (item) =>
    run(() =>
      request(`/clients/${id}/checklist/${item.id}`, {
        method: 'PATCH',
        body: { done: !item.done },
      })
    );

  function deleteItem(item) {
    if (!window.confirm(`Remove "${item.title}" from this client's checklist?`)) return;
    run(() => request(`/clients/${id}/checklist/${item.id}`, { method: 'DELETE' }));
  }

  async function addItem(e) {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    const d = await run(() =>
      request(`/clients/${id}/checklist`, {
        method: 'POST',
        body: {
          stage: newItem.stage,
          title: newItem.title.trim(),
          dueDate: newItem.dueDate || undefined,
        },
      })
    );
    if (d) setNewItem((n) => ({ ...n, title: '', dueDate: '' }));
  }

  async function addNote(e) {
    e.preventDefault();
    if (!note.text.trim()) return;
    const d = await run(() =>
      request(`/clients/${id}/notes`, {
        method: 'POST',
        body: { text: note.text.trim(), visibleToClient: note.visibleToClient },
      })
    );
    if (d) setNote((n) => ({ ...n, text: '' }));
  }

  async function uploadDoc(e) {
    e.preventDefault();
    if (!file) return setError('Choose a file first');
    if (file.size > 8 * 1024 * 1024) return setError('File is too large (max 8 MB)');

    const body = new FormData();
    body.append('file', file);
    body.append('label', upload.label.trim() || 'Document');
    if (upload.stage) body.append('stage', upload.stage);

    const d = await run(() => request(`/clients/${id}/documents`, { method: 'POST', body }));
    if (d) {
      setFile(null);
      setUpload({ label: '', stage: '' });
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function viewDoc(doc) {
    try {
      await openSignedUrl(() => request(`/clients/${id}/documents/${doc.id}/url`));
    } catch (e) {
      setError(e.message);
    }
  }

  function review(doc, status) {
    let reviewNote = '';
    if (status === 'rejected') {
      reviewNote = window.prompt('What should the client fix? (they will see this)');
      if (reviewNote === null) return;
    }
    run(() =>
      request(`/clients/${id}/documents/${doc.id}`, {
        method: 'PATCH',
        body: { status, reviewNote: reviewNote.trim() },
      })
    );
  }

  function deleteDoc(doc) {
    if (!window.confirm(`Permanently delete "${doc.label}"?`)) return;
    run(() => request(`/clients/${id}/documents/${doc.id}`, { method: 'DELETE' }));
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminHeader />
        <p className="p-10 text-center text-slate-500">{error || 'Loading client...'}</p>
      </div>
    );
  }

  const credsMessage = creds
    ? credentialsMessage({
        name: client.user.name,
        email: client.user.email,
        password: creds,
      })
    : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <Link to="/admin/clients" className="text-sm text-slate-500 hover:text-navy-900">
          &larr; All clients
        </Link>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {/* Header card */}
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-navy-900">{client.user.name}</h1>
              <p className="text-sm text-slate-600">
                {client.user.email} {client.user.phone && `· ${client.user.phone}`}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Overall progress: <strong>{client.progress.overall}%</strong>
                {!client.user.isActive && (
                  <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700">
                    Login disabled
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {client.user.phone && (
                <a
                  href={waLinkText(client.user.phone, `Hello ${client.user.name.split(' ')[0]}, `)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
                >
                  WhatsApp
                </a>
              )}
              <button
                onClick={resetPassword}
                disabled={busy}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Reset password
              </button>
              <button
                onClick={toggleActive}
                disabled={busy}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {client.user.isActive ? 'Disable login' : 'Enable login'}
              </button>
            </div>
          </div>

          {creds && (
            <div className="mt-4 rounded-xl bg-slate-100 p-4">
              <p className="text-sm font-medium text-slate-700">
                New temporary password (shown once):
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-800">{credsMessage}</pre>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(credsMessage)}
                  className="rounded-full border border-navy-900 px-4 py-1.5 text-sm font-semibold text-navy-900 hover:bg-white"
                >
                  Copy
                </button>
                <a
                  href={waLinkText(client.user.phone, credsMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
                >
                  Send on WhatsApp
                </a>
                <button onClick={() => setCreds(null)} className="text-sm text-slate-500">
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Profile */}
        <section className={card}>
          <h2 className={h2}>Journey details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              ['package', 'Package'],
              ['course', 'Course'],
              ['university', 'University'],
              ['intake', 'Intake'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600">{label}</label>
                <input
                  className={inputClass}
                  value={form[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600">
                Current stage (what the client sees as "Current")
              </label>
              <select
                className={inputClass}
                value={form.currentStage || ''}
                onChange={(e) => setForm((f) => ({ ...f, currentStage: e.target.value }))}
              >
                {JOURNEY.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={busy}
            className="mt-3 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-gold-300 hover:bg-navy-800 disabled:opacity-60"
          >
            Save details
          </button>
          {saved && <span className="ml-3 text-sm text-green-700">Saved</span>}
        </section>

        {/* Checklist */}
        <section className={card}>
          <h2 className={h2}>Checklist</h2>
          <div className="mt-4 space-y-5">
            {JOURNEY.map((stage) => {
              const items = client.checklist.filter((i) => i.stage === stage.key);
              const p = client.progress.stages.find((s) => s.key === stage.key);
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-navy-900">{stage.label}</h3>
                    <span className="text-xs text-slate-500">
                      {p?.done}/{p?.total}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#c9a45c]"
                          checked={item.done}
                          disabled={busy}
                          onChange={() => toggleItem(item)}
                        />
                        <span
                          className={`flex-1 text-sm ${
                            item.done ? 'text-slate-400 line-through' : 'text-slate-800'
                          }`}
                        >
                          {item.title}
                          {item.dueDate && (
                            <span className="ml-2 text-xs text-slate-500">
                              due {formatDate(item.dueDate)}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => deleteItem(item)}
                          className="text-xs text-slate-400 hover:text-red-600"
                          title="Remove"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="px-2 text-xs text-slate-400">No items in this stage.</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <form onSubmit={addItem} className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_2fr_1fr_auto]">
            <select
              className={inputClass}
              value={newItem.stage}
              onChange={(e) => setNewItem((n) => ({ ...n, stage: e.target.value }))}
            >
              {JOURNEY.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Add a custom checklist item"
              value={newItem.title}
              onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
            />
            <input
              type="date"
              className={inputClass}
              value={newItem.dueDate}
              onChange={(e) => setNewItem((n) => ({ ...n, dueDate: e.target.value }))}
            />
            <button
              type="submit"
              disabled={busy || !newItem.title.trim()}
              className="mt-1 rounded-lg bg-gold-500 px-4 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </section>

        {/* Documents */}
        <section className={card}>
          <h2 className={h2}>Documents</h2>

          <ul className="mt-3 space-y-2">
            {client.documents.map((doc) => (
              <li key={doc.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900">{doc.label}</p>
                    <p className="text-xs text-slate-500">
                      {doc.originalName} · {doc.format?.toUpperCase()} · {formatBytes(doc.bytes)} ·
                      uploaded by {doc.uploadedBy} on {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      DOC_STATUS[doc.status]?.cls
                    }`}
                  >
                    {DOC_STATUS[doc.status]?.label}
                  </span>
                </div>

                {doc.reviewNote && (
                  <p className="mt-1 text-xs text-slate-600">Note to client: {doc.reviewNote}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                  <button onClick={() => viewDoc(doc)} className="text-navy-900 hover:text-gold-600">
                    View
                  </button>
                  <button
                    onClick={() => review(doc, 'approved')}
                    disabled={busy}
                    className="text-green-700 hover:underline"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => review(doc, 'rejected')}
                    disabled={busy}
                    className="text-amber-700 hover:underline"
                  >
                    Request changes
                  </button>
                  <button
                    onClick={() => deleteDoc(doc)}
                    disabled={busy}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {client.documents.length === 0 && (
              <li className="text-sm text-slate-400">No documents uploaded yet.</li>
            )}
          </ul>

          <form onSubmit={uploadDoc} className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <input
              list="admin-doc-labels"
              className={inputClass}
              placeholder="Document label (e.g. Offer letter)"
              value={upload.label}
              onChange={(e) => setUpload((u) => ({ ...u, label: e.target.value }))}
            />
            <datalist id="admin-doc-labels">
              {DOC_LABEL_SUGGESTIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <select
              className={inputClass}
              value={upload.stage}
              onChange={(e) => setUpload((u) => ({ ...u, stage: e.target.value }))}
            >
              <option value="">Stage (optional)</option>
              {JOURNEY.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm sm:col-span-2"
            />
            <button
              type="submit"
              disabled={busy || !file}
              className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-gold-300 hover:bg-navy-800 disabled:opacity-50 sm:col-span-2 sm:w-fit"
            >
              {busy ? 'Uploading...' : 'Upload on client\'s behalf'}
            </button>
          </form>
        </section>

        {/* Notes */}
        <section className={card}>
          <h2 className={h2}>Notes</h2>
          <form onSubmit={addNote} className="mt-3 space-y-2">
            <textarea
              rows={3}
              className={inputClass}
              placeholder="Write a note..."
              value={note.text}
              onChange={(e) => setNote((n) => ({ ...n, text: e.target.value }))}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="accent-[#c9a45c]"
                  checked={note.visibleToClient}
                  onChange={(e) => setNote((n) => ({ ...n, visibleToClient: e.target.checked }))}
                />
                Visible to client
              </label>
              <button
                type="submit"
                disabled={busy || !note.text.trim()}
                className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-50"
              >
                Add note
              </button>
            </div>
          </form>

          <ul className="mt-4 space-y-2">
            {[...client.notes].reverse().map((n) => (
              <li key={n.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="text-slate-800">{n.text}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {n.authorName} · {new Date(n.createdAt).toLocaleString()} ·{' '}
                  <span className={n.visibleToClient ? 'text-green-700' : 'text-slate-500'}>
                    {n.visibleToClient ? 'Client can see this' : 'Internal only'}
                  </span>
                </p>
              </li>
            ))}
            {client.notes.length === 0 && <li className="text-sm text-slate-400">No notes yet.</li>}
          </ul>
        </section>
      </main>
    </div>
  );
}