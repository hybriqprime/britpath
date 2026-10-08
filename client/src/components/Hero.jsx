import { useState } from 'react';
import { Plane } from './ServiceArt.jsx';
import { WHATSAPP_URL } from '../config.js';
import { usePrefersReducedMotion } from '../lib/motion.js';

const ROUTE = 'M-40 330 C 200 300, 330 110, 600 150 S 1000 60, 1260 10';

export default function Hero() {
  const reduce = usePrefersReducedMotion();
  const [logoOk, setLogoOk] = useState(true);

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

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="order-last md:order-first">
          <h1
            className="hero-in text-4xl font-extrabold leading-tight tracking-tight text-brit-navy md:text-5xl"
            style={{ '--d': '600ms' }}
          >
            Your comprehensive A–Z UK study & settlement guidance
          </h1>
          <p
            className="hero-in mt-5 max-w-lg text-lg text-slate-700"
            style={{ '--d': '800ms' }}
          >
            From choosing the right university to your first week in the UK, we guide you step by
            step, based on your profile, your plans, your budget and your circumstances.
          </p>
          <div className="hero-in mt-7 flex flex-col gap-3 sm:flex-row" style={{ '--d': '1000ms' }}>
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

        <div className="flex justify-center">
          {logoOk ? (
            <img
              src="/brand/logo-full.png"
              alt="The BritPath: from ambition to arrival"
              className="hero-logo w-64 sm:w-80 md:w-[26rem]"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <p className="text-5xl font-extrabold tracking-tight">
              <span className="text-brit-navy">BRIT</span>
              <span className="text-brit-red">PATH</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}