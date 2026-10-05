import { WHATSAPP_URL } from '../config.js';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-navy-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="font-display text-xl tracking-wide text-gold-400">
          THE BRITPATH
        </a>

        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          <a href="#services" className="hover:text-gold-400">
            Services
          </a>
          <a href="#why" className="hover:text-gold-400">
            Why private counselling
          </a>
          <a href="#apply" className="hover:text-gold-400">
            Get started
          </a>
        </nav>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
        >
          WhatsApp us
        </a>
      </div>
    </header>
  );
}