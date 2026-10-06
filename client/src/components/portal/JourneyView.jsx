import { useState } from 'react';
import { JOURNEY, formatDate } from '../../lib/journeyMeta.js';

export default function JourneyView({ client }) {
  const [active, setActive] = useState(client.currentStage);

  const byKey = Object.fromEntries(client.progress.stages.map((s) => [s.key, s]));
  const items = client.checklist.filter((i) => i.stage === active);
  const activeLabel = JOURNEY.find((s) => s.key === active)?.label;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-navy-900">Your journey</h2>
        <span className="text-sm font-semibold text-navy-900">
          {client.progress.overall}% complete
        </span>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gold-500 transition-all"
          style={{ width: `${client.progress.overall}%` }}
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {JOURNEY.map((s, i) => {
          const p = byKey[s.key];
          const complete = p.total > 0 && p.done === p.total;
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left text-xs transition ${
                isActive
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-gold-500'
              }`}
            >
              <span
                className={`block font-semibold ${isActive ? 'text-gold-300' : 'text-gold-600'}`}
              >
                {complete ? '✓ ' : ''}
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="block w-28 leading-snug">{s.label}</span>
              <span className={`mt-1 block ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {p.done}/{p.total} done
              </span>
              {client.currentStage === s.key && (
                <span className="mt-1 block w-fit rounded bg-gold-500 px-1.5 py-0.5 text-[10px] font-semibold text-navy-950">
                  Current
                </span>
              )}
            </button>
          );
        })}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-navy-900">{activeLabel}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                item.done
                  ? 'border-gold-500 bg-gold-500 text-navy-950'
                  : 'border-slate-300 bg-white text-transparent'
              }`}
            >
              ✓
            </span>
            <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-800'}>
              {item.title}
              {item.dueDate && !item.done && (
                <span className="ml-2 text-xs text-amber-700">due {formatDate(item.dueDate)}</span>
              )}
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-slate-400">Nothing here yet.</li>}
      </ul>
    </section>
  );
}