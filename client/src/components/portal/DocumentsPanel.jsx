import { useRef, useState } from 'react';
import {
  JOURNEY,
  DOC_STATUS,
  DOC_LABEL_SUGGESTIONS,
  formatBytes,
  formatDate,
  openSignedUrl,
} from '../../lib/journeyMeta.js';

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';

export default function DocumentsPanel({ client, request, onUpdated }) {
  const [label, setLabel] = useState('');
  const [stage, setStage] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  async function upload(e) {
    e.preventDefault();
    setError('');
    if (!file) return setError('Please choose a file first');
    if (file.size > 8 * 1024 * 1024) return setError('File is too large (max 8 MB)');

    const body = new FormData();
    body.append('file', file);
    body.append('label', label.trim() || 'Document');
    if (stage) body.append('stage', stage);

    setBusy(true);
    try {
      const d = await request('/portal/documents', { method: 'POST', body });
      onUpdated(d.client);
      setFile(null);
      setLabel('');
      setStage('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function view(doc) {
    setError('');
    try {
      await openSignedUrl(() => request(`/portal/documents/${doc.id}/url`));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(doc) {
    if (!window.confirm(`Remove "${doc.label}"?`)) return;
    setError('');
    try {
      const d = await request(`/portal/documents/${doc.id}`, { method: 'DELETE' });
      onUpdated(d.client);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-bold text-navy-900">Your documents</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload clear copies (PDF, JPG or PNG, up to 8 MB each). Files are private and only you and
        your adviser can open them.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {client.documents.map((doc) => (
          <li key={doc.id} className="rounded-xl border border-slate-200 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-navy-900">{doc.label}</p>
                <p className="text-xs text-slate-500">
                  {doc.format?.toUpperCase()} · {formatBytes(doc.bytes)} · {formatDate(doc.uploadedAt)}
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
              <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                From your adviser: {doc.reviewNote}
              </p>
            )}

            <div className="mt-2 flex gap-4 text-xs font-semibold">
              <button onClick={() => view(doc)} className="text-navy-900 hover:text-gold-600">
                View
              </button>
              {doc.status !== 'approved' && (
                <button onClick={() => remove(doc)} className="text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
        {client.documents.length === 0 && (
          <li className="text-sm text-slate-400">No documents uploaded yet.</li>
        )}
      </ul>

      <form onSubmit={upload} className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600">What is this document?</label>
          <input
            list="portal-doc-labels"
            className={inputClass}
            placeholder="e.g. Passport"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <datalist id="portal-doc-labels">
            {DOC_LABEL_SUGGESTIONS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Related stage (optional)</label>
          <select className={inputClass} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">Not sure / general</option>
            {JOURNEY.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
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
          className="rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-gold-300 hover:bg-navy-800 disabled:opacity-50 sm:col-span-2 sm:w-fit"
        >
          {busy ? 'Uploading...' : 'Upload document'}
        </button>
      </form>
    </section>
  );
}