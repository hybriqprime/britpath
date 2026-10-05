import { WHATSAPP_URL } from '../config.js';

export default function Hero() {
  return (
    <section id="top" className="bg-gradient-to-b from-navy-900 to-navy-800 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
          Private UK Counselling & Relocation Service
        </p>

        <h1 className="font-display text-4xl font-bold leading-tight text-gold-300 md:text-6xl">
          Your comprehensive A–Z UK study & settlement guidance
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
          From choosing the right university to your first week in the UK, we guide you step by
          step, based on your profile, your plans, your budget and your circumstances.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#apply"
            className="w-full rounded-full bg-gold-500 px-8 py-3 font-semibold text-navy-950 transition hover:bg-gold-400 sm:w-auto"
          >
            Start your profile review
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-full border border-gold-400 px-8 py-3 font-semibold text-gold-300 transition hover:bg-navy-700 sm:w-auto"
          >
            Chat on WhatsApp
          </a>
        </div>

        <p className="mt-12 text-sm font-semibold uppercase tracking-widest text-gold-400">
          Your UK journey deserves more than guesswork.
        </p>
      </div>
    </section>
  );
}