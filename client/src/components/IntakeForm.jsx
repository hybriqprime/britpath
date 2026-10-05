import { useState } from 'react';
import { api } from '../api.js';
import { WHATSAPP_URL } from '../config.js';

const SERVICE_OPTIONS = [
  { value: 'study', label: 'School & admission' },
  { value: 'visa', label: 'CAS, pre-visa & visa guidance' },
  { value: 'flights', label: 'Flight & travel' },
  { value: 'accommodation', label: 'Accommodation & settling in' },
  { value: 'employment', label: 'Employment & career' },
  { value: 'post_arrival', label: 'Post-arrival admin (NI, bank, NHS)' },
];

const initial = {
  name: '',
  phone: '',
  email: '',
  course: '',
  level: '',
  intake: '',
  budget: '',
  currentStatus: '',
  visaRefusal: 'no',
  ukTravelBefore: 'no',
  services: [],
  message: '',
  consent: false,
  website: '', // honeypot: must stay empty
};

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function IntakeForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [error, setError] = useState('');

  const source = new URLSearchParams(window.location.search).get('src') || 'website';

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleService = (value) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(value)
        ? f.services.filter((s) => s !== value)
        : [...f.services, value],
    }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.consent) {
      setError('Please tick the consent box so we can contact you.');
      return;
    }

    setStatus('loading');
    try {
      await api('/leads/public', {
        method: 'POST',
        body: {
          ...form,
          visaRefusal: form.visaRefusal === 'yes',
          ukTravelBefore: form.ukTravelBefore === 'yes',
          source,
        },
      });
      setStatus('done');
      setForm(initial);
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="py-6 text-center">
        <h3 className="font-display text-2xl font-bold text-navy-900">Thank you!</h3>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          We have received your details and will review them. We will contact you on WhatsApp
          shortly.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-400"
        >
          Message us on WhatsApp now
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Full name *
          </label>
          <input id="name" className={inputClass} value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">
            WhatsApp number *
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+234 801 234 5678"
            className={inputClass}
            value={form.phone}
            onChange={set('phone')}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email (optional)
        </label>
        <input id="email" type="email" className={inputClass} value={form.email} onChange={set('email')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="course">
            Course you want to study
          </label>
          <input
            id="course"
            placeholder="e.g. MSc Data Science"
            className={inputClass}
            value={form.course}
            onChange={set('course')}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="level">
            Level
          </label>
          <select id="level" className={inputClass} value={form.level} onChange={set('level')}>
            <option value="">Select level</option>
            <option value="foundation">Foundation</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
            <option value="other">Other / not sure</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="intake">
            Preferred intake
          </label>
          <select id="intake" className={inputClass} value={form.intake} onChange={set('intake')}>
            <option value="">Select intake</option>
            <option value="January">January</option>
            <option value="May">May</option>
            <option value="September">September</option>
            <option value="Not sure">Not sure yet</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="budget">
            Budget range
          </label>
          <input
            id="budget"
            placeholder="e.g. ₦15m to ₦20m"
            className={inputClass}
            value={form.budget}
            onChange={set('budget')}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="currentStatus">
          Your current status
        </label>
        <input
          id="currentStatus"
          placeholder="e.g. Graduated 2024, working, already applied to a school"
          className={inputClass}
          value={form.currentStatus}
          onChange={set('currentStatus')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="visaRefusal">
            Any previous visa refusal?
          </label>
          <select id="visaRefusal" className={inputClass} value={form.visaRefusal} onChange={set('visaRefusal')}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ukTravelBefore">
            Travelled to the UK before?
          </label>
          <select
            id="ukTravelBefore"
            className={inputClass}
            value={form.ukTravelBefore}
            onChange={set('ukTravelBefore')}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>What do you need help with?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-gold-500"
            >
              <input
                type="checkbox"
                className="accent-[#c9a45c]"
                checked={form.services.includes(opt.value)}
                onChange={() => toggleService(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="message">
          Anything else we should know?
        </label>
        <textarea
          id="message"
          rows={3}
          className={inputClass}
          value={form.message}
          onChange={set('message')}
        />
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set('website')}
          />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          className="mt-1 accent-[#c9a45c]"
          checked={form.consent}
          onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
        />
        <span>
          I agree that The BritPath may contact me about my enquiry and store my details for that
          purpose.
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-full bg-navy-900 px-6 py-3 font-semibold text-gold-300 transition hover:bg-navy-800 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending...' : 'Get my free profile review'}
      </button>
    </form>
  );
}