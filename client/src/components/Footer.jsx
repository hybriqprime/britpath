import { Link } from 'react-router-dom';
import { PHONE_DISPLAY, EMAIL, WEBSITE, WHATSAPP_URL } from '../config.js';

export default function Footer() {
  return (
    <footer className="bg-navy-950 py-10 text-slate-300">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-xl font-extrabold tracking-tight">
              <span className="text-white">BRIT</span>
              <span className="text-gold-400">PATH</span>
            </p>
            <p className="mt-2 text-sm">From ambition to arrival.</p>
            <p className="mt-1 text-sm">Lagos, Nigeria | London, UK</p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-gold-400">Contact</p>
            <p className="mt-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-gold-300">
                {PHONE_DISPLAY}
              </a>
            </p>
            <p>
              <a href={`mailto:${EMAIL}`} className="hover:text-gold-300">
                {EMAIL}
              </a>
            </p>
            <p>{WEBSITE}</p>
          </div>

          <div className="text-sm">
            <p className="font-semibold text-gold-400">Please note</p>
            <p className="mt-2 text-slate-400">
              The BritPath provides guidance and preparation support. We are not a law firm, we do
              not give regulated immigration advice, and we do not guarantee admission or visa
              outcomes.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-700 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The BritPath. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to="/privacy" className="hover:text-gold-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold-300">Terms of Service</Link>
            <Link to="/disclaimer" className="hover:text-gold-300">Advice Disclaimer</Link>
            <Link to="/portal/login" className="hover:text-gold-300">Client portal</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}