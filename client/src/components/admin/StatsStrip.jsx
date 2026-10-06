export default function StatsStrip({ stats }) {
  if (!stats) return null;

  const b = stats.byStatus || {};
  const pipeline = (b.enquiry || 0) + (b.qualified || 0) + (b.booked || 0);
  const clients = (b.paid || 0) + (b.in_progress || 0) + (b.arrived || 0) + (b.alumni || 0);
  const conversion = stats.total ? Math.round((clients / stats.total) * 100) : 0;

  const cards = [
    { label: 'Total leads', value: stats.total },
    { label: 'New (7 days)', value: stats.last7Days },
    { label: 'In pipeline', value: pipeline },
    { label: 'Paying clients', value: clients },
    { label: 'Conversion', value: `${conversion}%` },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-navy-900">{c.value}</p>
          </div>
        ))}
      </div>

      {stats.bySource?.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Sources:</span>
          {stats.bySource.map((s) => (
            <span
              key={s.source}
              className="rounded-full bg-gold-300/40 px-3 py-1 font-medium text-navy-900"
            >
              {s.source}: {s.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}