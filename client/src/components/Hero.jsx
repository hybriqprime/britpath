import { Plane } from './ServiceArt.jsx';
import AutoVideo from './AutoVideo.jsx';
import { WHATSAPP_URL } from '../config.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

const ROUTE = 'M-40 330 C 200 300, 330 110, 600 150 S 1000 60, 1260 10';

export default function Hero() {
  const reduce = usePrefersReducedMotion();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-[#dbe7fa] via-[#eef3fc] to-white"
    >
      {/* Flight route with a plane that travels along it */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 360"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full"
      >
        <path
          id="route"
          d={ROUTE}
          fill="none"
          stroke="#12266e"
          strokeOpacity=".3"
          strokeWidth="2.5"
          strokeDasharray="7 11"
          className={reduce ? '' : 'hero-route'}
        />
        {reduce ? (
          <g transform="translate(600 150)">
            <Plane scale={1.8} />
          </g>
        ) : (
          <g>
            <Plane scale={1.8} />
            <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
              <mpath href="#route" />
            </animateMotion>
          </g>
        )}
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
        <div>
          <p
            className="hero-in text-sm font-semibold text-brit-red"
            style={{ '--d': '200ms' }}
          >
            From ambition to arrival.
          </p>
          <h1
            className="hero-in mt-3 text-3xl font-extrabold leading-tight tracking-tight text-brit-navy sm:text-4xl lg:text-5xl"
            style={{ '--d': '350ms' }}
          >
            Your comprehensive A–Z UK study & settlement guidance
          </h1>
          <p
            className="hero-in mt-5 max-w-lg text-lg text-slate-700"
            style={{ '--d': '550ms' }}
          >
            From choosing the right university to your first week in the UK, we guide you step by
            step, based on your profile, your plans, your budget and your circumstances.
          </p>
          <div className="hero-in mt-7 flex flex-col gap-3 sm:flex-row" style={{ '--d': '750ms' }}>
            <a
              href="#apply"
              className="rounded-full bg-brit-red px-8 py-3 text-center font-semibold text-white hover:bg-[#a60d26]"
            >
              Start your profile review
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-brit-navy px-8 py-3 text-center font-semibold text-brit-navy hover:bg-white"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="hero-in flex justify-center md:justify-end" style={{ '--d': '900ms' }}>
          <AutoVideo
            src="/media/london.mp4"
            poster="/media/london-poster.jpg"
            label="London street at dusk"
            className="aspect-[9/16] w-48 rounded-3xl border-4 border-white bg-navy-900 object-cover shadow-2xl sm:w-56 md:w-60 lg:w-72"
          />
        </div>
      </div>
    </section>
  );
}