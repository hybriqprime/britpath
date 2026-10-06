import { useMemo, useState } from 'react';
import { STAGES, SERVICE_LABEL, timeAgo } from '../../lib/leadMeta.js';

export default function PipelineBoard({ leads, onMove, onSelect, selectedId }) {
  const [overStage, setOverStage] = useState(null);

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.key, []]));
    leads.forEach((l) => {
      if (map[l.status]) map[l.status].push(l);
    });
    return map;
  }, [leads]);

  function handleDrop(e, stage) {
    e.preventDefault();
    setOverStage(null);
    const id = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l._id === id);
    if (lead && lead.status !== stage) onMove(id, stage);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => (
        <div
          key={stage.key}
          onDragOver={(e) => {
            e.preventDefault();
            setOverStage(stage.key);
          }}
          onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
          onDrop={(e) => handleDrop(e, stage.key)}
          className={`w-72 shrink-0 rounded-xl border p-3 transition ${
            overStage === stage.key
              ? 'border-gold-500 bg-gold-300/20'
              : 'border-slate-200 bg-slate-100'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy-900">{stage.label}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
              {byStage[stage.key].length}
            </span>
          </div>

          <div className="space-y-2">
            {byStage[stage.key].map((lead) => (
              <div
                key={lead._id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', lead._id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => onSelect(lead._id)}
                className={`cursor-pointer rounded-lg border bg-white p-3 text-sm shadow-sm transition hover:shadow-md ${
                  selectedId === lead._id ? 'border-gold-500 ring-2 ring-gold-400/40' : 'border-slate-200'
                }`}
              >
                <p className="font-semibold text-navy-900">{lead.name}</p>
                <p className="text-xs text-slate-500">{lead.phone}</p>

                {(lead.course || lead.intake) && (
                  <p className="mt-2 text-xs text-slate-700">
                    {[lead.course, lead.intake].filter(Boolean).join(' · ')}
                  </p>
                )}

                {lead.services?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {lead.services.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="rounded bg-navy-900/5 px-1.5 py-0.5 text-[11px] text-navy-800"
                      >
                        {SERVICE_LABEL[s] || s}
                      </span>
                    ))}
                    {lead.services.length > 2 && (
                      <span className="text-[11px] text-slate-500">+{lead.services.length - 2}</span>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {lead.source} · {timeAgo(lead.createdAt)}
                  </span>
                  {lead.visaRefusal && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-700">
                      Visa refusal
                    </span>
                  )}
                </div>
              </div>
            ))}

            {byStage[stage.key].length === 0 && (
              <p className="py-4 text-center text-xs text-slate-400">Drop leads here</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}