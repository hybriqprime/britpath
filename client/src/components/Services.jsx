const services = [
  {
    title: 'School & Admission',
    items: ['Profile assessment', 'University research & selection', 'Application guidance', 'Admission process'],
  },
  {
    title: 'CAS & Pre-Visa',
    items: ['Documentation guidance', 'Proof of funds strategy', 'Document review', 'Pre-CAS support'],
  },
  {
    title: 'UK Visa Guidance',
    items: ['Student visa application', 'Document checklist', 'Interview preparation', 'Post-application support'],
  },
  {
    title: 'Flight & Travel',
    items: ['Flight-search guidance', 'Cost-reduction strategies', 'Airport arrival guidance'],
  },
  {
    title: 'Accommodation & Settling In',
    items: ['Search guidance', 'Tenancy understanding', 'Area selection', 'First-week support'],
  },
  {
    title: 'Employment & Career',
    items: ['Job search strategies', 'CV & application guidance', 'Part-time employment rights', 'Workplace expectations'],
  },
  {
    title: 'Post-Arrival Administration',
    items: ['National Insurance (NI) number', 'Banking setup', 'NHS registration', 'Essential systems'],
  },
  {
    title: 'Integration & Ongoing Support',
    items: ['System understanding', 'Avoiding mistakes', 'Confident living'],
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-bold text-navy-900 md:text-4xl">
          Everything for your UK journey, A to Z
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Eight areas of support, from your first university shortlist to settling in confidently.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-gold-500 hover:shadow-md"
            >
              <span className="font-display text-2xl text-gold-600">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1 font-semibold text-navy-900">{s.title}</h3>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-gold-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}