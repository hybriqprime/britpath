import { useState } from 'react';
import { WHATSAPP_URL } from '../config.js';

export default function Navbar() {
  const [markOk, setMarkOk] = useState(true);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <a href="#top" className="flex items-center gap-2" aria-label="The BritPath home">
          {markOk && (
            <img
              src="/brand/logo-mark.png"
              alt=""
              className="h-10 w-auto"
              onError={() => setMarkOk(false)}
            />
          )}
          <span className="leading-none">
            <span className="block text-[10px] font-semibold tracking-[0.4em] text-brit-navy">THE</span>
            <span className="block text-xl font-extrabold tracking-tight">
              <span className="text-brit-navy">BRIT</span>
              <span className="text-brit-red">PATH</span>
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <a href="#services" className="hover:text-brit-red">What we do</a>
          <a href="#why" className="hover:text-brit-red">Why private counselling</a>
          <a href="#apply" className="hover:text-brit-red">Get started</a>
        </nav>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-brit-red px-4 py-2 text-sm font-semibold text-white hover:bg-[#a60d26]"
        >
          WhatsApp us
        </a>
      </div>
    </header>
  );
}