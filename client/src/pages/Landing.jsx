import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import IntakeForm from '../components/IntakeForm.jsx';
import Footer from '../components/Footer.jsx';

const reasons = [
  {
    title: 'Built around you',
    text: 'We look at your profile, your plans, your budget and your circumstances, not a one-size-fits-all package.',
  },
  {
    title: 'Clear, step-by-step',
    text: 'From admission to your first week in the UK, you always know what comes next and what it needs.',
  },
  {
    title: 'Avoid costly mistakes',
    text: 'Understand the systems before you commit, so you avoid the errors that cost students time and money.',
  },
];

export default function Landing() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />

      <section id="why" className="bg-navy-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl font-bold text-gold-300 md:text-4xl">
            Why private counselling?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-gold-500/30 bg-navy-800 p-6"
              >
                <h3 className="text-lg font-semibold text-gold-400">{r.title}</h3>
                <p className="mt-2 text-slate-200">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center font-display text-3xl font-bold text-navy-900 md:text-4xl">
            Start with a free profile review
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Tell us a little about your plans. We will review your answers and contact you on
            WhatsApp with the best next step.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <IntakeForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}