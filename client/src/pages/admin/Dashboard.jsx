import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import AdminHeader from '../../components/admin/AdminHeader.jsx';
import StatsStrip from '../../components/admin/StatsStrip.jsx';
import PipelineBoard from '../../components/admin/PipelineBoard.jsx';
import LeadDetail from '../../components/admin/LeadDetail.jsx';

export default function Dashboard() {
  const { request } = useAuth();

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [source, setSource] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (debouncedQ) params.set('q', debouncedQ);
      if (source) params.set('source', source);

      const [list, st] = await Promise.all([
        request(`/leads?${params.toString()}`),
        request('/leads/stats'),
      ]);
      setLeads(list.leads);
      setTotal(list.total);
      setStats(st);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request, debouncedQ, source]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshStats = useCallback(() => {
    request('/leads/stats')
      .then(setStats)
      .catch(() => {});
  }, [request]);

  const moveLead = useCallback(
    async (id, status) => {
      let extra = {};
      if (status === 'lost') {
        const reason = window.prompt(
          'Why was this lead lost? (e.g. budget, went elsewhere, no response)'
        );
        if (reason === null) return;
        extra = { lostReason: reason.trim().slice(0, 120) };
      }

      const previous = leads;
      setLeads((ls) => ls.map((l) => (l._id === id ? { ...l, status, ...extra } : l)));

      try {
        await request(`/leads/${id}`, { method: 'PATCH', body: { status, ...extra } });
        refreshStats();
      } catch (err) {
        setLeads(previous);
        setError(err.message);
      }
    },
    [leads, request, refreshStats]
  );

  const handleChanged = useCallback(
    (updated) => {
      setLeads((ls) => ls.map((l) => (l._id === updated._id ? { ...l, ...updated } : l)));
      refreshStats();
    },
    [refreshStats]
  );

  const handleDeleted = useCallback(
    (id) => {
      setLeads((ls) => ls.filter((l) => l._id !== id));
      setTotal((t) => Math.max(t - 1, 0));
      setSelectedId(null);
      refreshStats();
    },
    [refreshStats]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-6">
        <StatsStrip stats={stats} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email or course"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40 sm:max-w-sm"
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
          >
            <option value="">All sources</option>
            {stats?.bySource?.map((s) => (
              <option key={s.source} value={s.source}>
                {s.source}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Refresh
          </button>
          <span className="text-xs text-slate-500">
            Showing {leads.length} of {total}
            {total > leads.length && ' (newest 100: use search to narrow)'}
          </span>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-slate-500">Loading leads...</p>
        ) : (
          <PipelineBoard
            leads={leads}
            onMove={moveLead}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        )}
      </main>

      {selectedId && (
        <LeadDetail
          leadId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={handleChanged}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}