import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { WHATSAPP_URL } from '../../config.js';
import JourneyView from '../../components/portal/JourneyView.jsx';
import DocumentsPanel from '../../components/portal/DocumentsPanel.jsx';
import ChangePassword from '../../components/portal/ChangePassword.jsx';
import { formatDate } from '../../lib/journeyMeta.js';

export default function Portal() {
  const { user, logout, request } = useAuth();
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    request('/portal/me')
      .then((d) => {
        if (!cancelled) setClient(d.client);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  const first = (user?.name || '').split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="font-display text-xl tracking-wide text-gold-400">THE BRITPATH</span>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="hidden text-slate-300 hover:text-gold-300 sm:inline">
              Website
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-gold-400 px-4 py-1.5 text-gold-300 hover:bg-navy-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">
              Welcome, {first}
            </h1>
            {client && (
              <p className="mt-1 text-sm text-slate-600">
                {[client.package, client.course, client.university, client.intake && `${client.intake} intake`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
          >
            Message your adviser
          </a>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {!client && !error && <p className="py-10 text-center text-slate-500">Loading your journey...</p>}

        {client && (
          <>
            <JourneyView client={client} />

            {client.notes.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-display text-lg font-bold text-navy-900">
                  Messages from your adviser
                </h2>
                <ul className="mt-3 space-y-2">
                  {[...client.notes].reverse().map((n) => (
                    <li key={n.id} className="rounded-lg bg-gold-300/20 p-3 text-sm text-slate-800">
                      <p>{n.text}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(n.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <DocumentsPanel client={client} request={request} onUpdated={setClient} />

            <ChangePassword request={request} />
          </>
        )}

        <p className="pb-6 text-center text-xs text-slate-400">
          The BritPath provides guidance and preparation support. We do not guarantee admission or
          visa outcomes.
        </p>
      </main>
    </div>
  );
}