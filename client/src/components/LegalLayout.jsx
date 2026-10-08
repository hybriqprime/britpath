import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL } from '../config.js';

export function Section({ title, children }) {
  return (
    <section className="mt-9">
      <h2 className="text-xl font-bold text-brit-navy">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export function List({ items }) {
  return (
    <ul className="list-disc space-y-1.5 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function LegalLayout({ title, intro, children }) {
  useEffect(() => {
    document.title = `${title} | The BritPath`;
  }, [title]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            <span className="text-brit-navy">BRIT</span>
            <span className="text-brit-red">PATH</span>
          </Link>
          <Link to="/" className="text-sm text-slate-600 hover:text-brit-red">
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-brit-navy md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {LEGAL.updated}</p>
        {intro && <p className="mt-5 text-lg text-slate-700">{intro}</p>}

        {children}

        <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-6 text-sm">
          <Link to="/privacy" className="text-brit-navy underline">Privacy Policy</Link>
          <Link to="/terms" className="text-brit-navy underline">Terms of Service</Link>
          <Link to="/disclaimer" className="text-brit-navy underline">Advice Disclaimer</Link>
        </nav>
      </main>
    </div>
  );
}