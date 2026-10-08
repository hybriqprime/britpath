const N = '#12266e';
const R = '#c8102e';
const SOFT = '#9db3de';

export function Plane({ scale = 1, body = N, wing = R }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d="M-16 0 L10 -4 Q18 -4 18 0 Q18 4 10 4 Z" fill={body} />
      <path d="M-2 -1 L-10 -14 L-6 -14 L6 -2 Z" fill={wing} />
      <path d="M-2 1 L-10 14 L-6 14 L6 2 Z" fill={wing} />
      <path d="M-16 0 L-21 -7 L-17 -7 L-11 -1 Z" fill={wing} />
      <path d="M-16 0 L-21 7 L-17 7 L-11 1 Z" fill={wing} />
    </g>
  );
}

const ART = {
  // School & admission: mortarboard over an open book
  school: (
    <>
      <ellipse cx="100" cy="106" rx="54" ry="6" fill={N} opacity=".1" />
      <path d="M100 78 C88 70 70 70 56 74 V96 C70 92 88 92 100 100 Z" fill="#fff" stroke={N} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 78 C112 70 130 70 144 74 V96 C130 92 112 92 100 100 Z" fill="#fff" stroke={N} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 18 L148 39 L100 60 L52 39 Z" fill={N} />
      <path d="M76 49 V63 C88 71 112 71 124 63 V49 L100 60 Z" fill="#1d3a8f" />
      <g className="a-swing">
        <path d="M148 39 V62" stroke={R} strokeWidth="2.5" />
        <circle cx="148" cy="66" r="4.5" fill={R} />
      </g>
    </>
  ),
  // CAS & pre-visa: document with a check that draws itself
  cas: (
    <>
      <rect x="72" y="26" width="64" height="80" rx="6" fill="#cfdcf3" transform="rotate(8 104 66)" />
      <rect x="64" y="20" width="68" height="86" rx="6" fill="#fff" stroke={N} strokeWidth="2.5" />
      <path d="M76 38 H120 M76 50 H120 M76 62 H102" stroke={SOFT} strokeWidth="4" strokeLinecap="round" />
      <circle cx="122" cy="92" r="17" fill={R} />
      <path className="a-draw" pathLength="1" d="M113 92 l7 7 13-15" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // UK visa guidance: passport with a stamp
  visa: (
    <>
      <rect x="64" y="14" width="68" height="92" rx="8" fill={N} />
      <circle cx="98" cy="50" r="16" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M82 50 H114 M98 34 C89 42 89 58 98 66 C107 58 107 42 98 34" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M78 86 H118 M84 95 H112" stroke={R} strokeWidth="3.5" strokeLinecap="round" />
      <g className="a-pop">
        <circle cx="142" cy="88" r="17" fill="#fff" fillOpacity=".85" stroke={R} strokeWidth="3" strokeDasharray="4 3" />
        <path d="M142 77 l3 6.5 7 .8 -5.2 4.8 1.4 7 -6.2 -3.5 -6.2 3.5 1.4 -7 -5.2 -4.8 7 -.8 z" fill={R} />
      </g>
    </>
  ),
  // Flight & travel: plane on a dashed route above clouds
  flight: (
    <>
      <path className="a-dash" d="M16 98 C56 30 140 26 186 72" fill="none" stroke={N} strokeOpacity=".4" strokeWidth="2.5" strokeDasharray="6 7" />
      <ellipse cx="46" cy="98" rx="32" ry="9" fill="#fff" />
      <ellipse cx="150" cy="102" rx="36" ry="10" fill="#fff" />
      <g className="a-fly">
        <g transform="translate(100 46) rotate(-8)">
          <Plane scale={1.8} />
        </g>
      </g>
    </>
  ),
  // Accommodation: house with glowing windows
  home: (
    <>
      <rect x="118" y="30" width="10" height="22" fill={N} />
      <path d="M48 62 L100 20 L152 62 Z" fill={R} />
      <rect x="62" y="62" width="76" height="44" fill="#fff" stroke={N} strokeWidth="2.5" />
      <rect x="92" y="76" width="16" height="30" rx="2" fill={N} />
      <rect className="a-glow" x="68" y="70" width="16" height="14" rx="2" fill="#f3c969" />
      <rect className="a-glow" x="116" y="70" width="16" height="14" rx="2" fill="#f3c969" style={{ animationDelay: '-1.6s' }} />
    </>
  ),
  // Employment & career: briefcase with a CV
  career: (
    <>
      <g className="a-float">
        <g transform="rotate(-6 100 42)">
          <rect x="78" y="14" width="44" height="48" rx="3" fill="#fff" stroke={N} strokeWidth="2" />
          <circle cx="90" cy="27" r="4.5" fill={SOFT} />
          <path d="M99 26 H114 M84 42 H116 M84 51 H106" stroke={SOFT} strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <path d="M86 60 V50 H114 V60" fill="none" stroke={N} strokeWidth="4" />
      <rect x="56" y="58" width="88" height="48" rx="8" fill={N} />
      <rect x="56" y="76" width="88" height="5" fill="#1d3a8f" />
      <rect x="94" y="72" width="12" height="13" rx="2" fill={R} />
    </>
  ),
  // Post-arrival admin: bank card and ID card
  admin: (
    <>
      <g className="a-float">
        <g transform="rotate(-8 84 56)">
          <rect x="40" y="28" width="88" height="56" rx="8" fill={N} />
          <rect x="40" y="40" width="88" height="10" fill="#0a1744" />
          <rect x="52" y="60" width="18" height="13" rx="2.5" fill="#f3c969" />
          <path d="M80 68 H116" stroke={SOFT} strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <g className="a-float2">
        <g transform="rotate(7 126 82)">
          <rect x="92" y="60" width="72" height="46" rx="7" fill="#fff" stroke={N} strokeWidth="2.5" />
          <circle cx="111" cy="78" r="7" fill={SOFT} />
          <path d="M124 74 H152 M124 84 H146 M100 96 H152" stroke={SOFT} strokeWidth="3" strokeLinecap="round" />
          <rect x="140" y="64" width="16" height="6" rx="1" fill={R} />
        </g>
      </g>
    </>
  ),
  // Integration: clock tower and skyline
  integration: (
    <>
      <path d="M10 106 H190" stroke={N} strokeOpacity=".35" strokeWidth="2" />
      <path d="M14 106 V88 H30 V76 H46 V106 Z M152 106 V84 H166 V94 H178 V72 H192 V106 Z" fill={SOFT} />
      <rect x="88" y="44" width="24" height="62" fill={N} />
      <path d="M86 44 L100 12 L114 44 Z" fill={N} />
      <circle cx="100" cy="58" r="9" fill="#fff" />
      <g className="a-spin" style={{ transformOrigin: '100px 58px' }}>
        <path d="M100 58 V51" stroke={N} strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M100 58 H105" stroke={R} strokeWidth="2" strokeLinecap="round" />
      <path d="M95 78 V98 M105 78 V98" stroke="#1d3a8f" strokeWidth="2.5" />
    </>
  ),
};

export default function ServiceArt({ name }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      {ART[name]}
    </svg>
  );
}