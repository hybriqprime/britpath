export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-center text-2xl font-extrabold tracking-tight">
          <span className="text-brit-navy">BRIT</span>
          <span className="text-brit-red">PATH</span>
        </p>
        <h1 className="mt-4 text-center text-lg font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export const authInput =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';
export const authButton =
  'w-full rounded-full bg-navy-900 px-6 py-3 font-semibold text-gold-300 transition hover:bg-navy-800 disabled:opacity-60';