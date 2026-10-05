import { PHONE_DISPLAY, EMAIL, WEBSITE, WHATSAPP_URL } from '../config.js';

export default function Footer() {
  return (
    <footer className="bg-navy-950 py-10 text-slate-300">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-xl text-gold-400">THE BRITPATH</p>
            <p className="mt-2 text-sm">Private UK Counselling & Relocation Service</p>
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
              The BritPath provides guidance and preparation support. We do not guarantee
              admission or visa outcomes.
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-700 pt-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} The BritPath. All rights reserved.
        </p>
      </div>
    </footer>
  );
}