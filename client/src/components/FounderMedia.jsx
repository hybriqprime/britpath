import { FOUNDER } from '../config.js';

export default function FounderMedia() {
  return (
    <div className="mt-16 grid items-center gap-10 md:grid-cols-2">
      <div>
        <h3 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Meet the founder
        </h3>
        <p className="mt-4 text-xl font-semibold text-gold-300">{FOUNDER.name}</p>
        <p className="text-slate-300">{FOUNDER.title}, The BritPath</p>
        <p className="mt-4 max-w-md text-slate-200">Speaking with students in the UK.</p>
        <a
          href="#apply"
          className="mt-6 inline-block rounded-full bg-brit-red px-6 py-3 font-semibold text-white hover:bg-[#a60d26]"
        >
          Start your profile review
        </a>
      </div>

      <div className="flex justify-center md:justify-end">
        <video
          controls
          playsInline
          preload="none"
          poster="/media/founder-talk-poster.jpg"
          aria-label={`${FOUNDER.name} speaking to students`}
          className="aspect-[9/16] w-56 rounded-2xl border-2 border-gold-500/40 bg-navy-950 object-cover shadow-2xl sm:w-64 md:w-72"
        >
          <source src="/media/founder-talk.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}