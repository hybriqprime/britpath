import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import AdminHeader from '../../components/admin/AdminHeader.jsx';
import ConvertLeadModal from '../../components/admin/ConvertLeadModal.jsx';
import { JOURNEY_LABEL } from '../../lib/journeyMeta.js';

export default function Clients() {
  const { request } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConvert, setShowConvert] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const d = await request('/clients');
      setClients(d.clients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-navy-900">Clients</h1>
          <button
            onClick={() => setShowConvert(true)}
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
          >
            Convert a lead
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-slate-500">Loading clients...</p>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No clients yet. When a lead pays, click <strong>Convert a lead</strong> to create their
            portal account.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Current stage</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Documents</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                      {c.isActive === false && (
                        <span className="mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">
                          Login disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.package || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {JOURNEY_LABEL[c.currentStage] || c.currentStage}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gold-500"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.pendingDocs > 0 ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          {c.pendingDocs} to review
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Up to date</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/clients/${c.id}`}
                        className="font-semibold text-navy-900 hover:text-gold-600"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showConvert && (
        <ConvertLeadModal onClose={() => setShowConvert(false)} onCreated={load} />
      )}
    </div>
  );
}