import { useEffect, useRef, useState } from 'react';
import ServiceArt from './ServiceArt.jsx';

const services = [
  { id: 'school', title: 'School & Admission', items: ['Profile assessment', 'University research & selection', 'Application guidance', 'Admission process'] },
  { id: 'cas', title: 'CAS & Pre-Visa', items: ['Documentation guidance', 'Proof of funds strategy', 'Document review', 'Pre-CAS support'] },
  { id: 'visa', title: 'UK Visa Guidance', items: ['Student visa application', 'Document checklist', 'Interview preparation', 'Post-application support'] },
  { id: 'flight', title: 'Flight & Travel', items: ['Flight-search guidance', 'Cost-reduction strategies', 'Airport arrival guidance'] },
  { id: 'home', title: 'Accommodation & Settling In', items: ['Search guidance', 'Tenancy understanding', 'Area selection', 'First-week support'] },
  { id: 'career', title: 'Employment & Career', items: ['Job search strategies', 'CV & application guidance', 'Part-time employment rights', 'Workplace expectations'] },
  { id: 'admin', title: 'Post-Arrival Administration', items: ['National Insurance (NI) number', 'Banking setup', 'NHS registration', 'Essential systems'] },
  { id: 'integration', title: 'Integration & Ongoing Support', items: ['System understanding', 'Avoiding mistakes', 'Confident living'] },
];

// Illustration by default. If /services/<id>.jpg loads as a real image, it covers the illustration.
function ServiceImage({ id, title }) {
  const [ok, setOk] = useState(false);
  const ref = useRef(null);

  // Handles images the browser already had cached before React attached onLoad
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setOk(true);
  }, []);

  return (
    <div className="relative aspect-[5/3] overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#e6eefb] to-[#d3e0f6]">
      <ServiceArt name={id} />
      <img
        ref={ref}
        src={`/services/${id}.jpg`}
        alt={ok ? title : ''}
        onLoad={() => setOk(true)}
        onError={() => setOk(false)}
        className={`absolute inset-0 h-full w-full object-cover ${ok ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-brit-navy md:text-4xl">
          What we do
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Eight areas of support, from your first university shortlist to settling in confidently.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <article key={s.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <ServiceImage id={s.id} title={s.title} />
              <div className="p-5">
                <h3 className="font-bold text-brit-navy">{s.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                  {s.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brit-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}