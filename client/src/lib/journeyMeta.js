export const JOURNEY = [
  { key: 'school_admission', label: 'School & admission' },
  { key: 'cas_pre_visa', label: 'CAS & pre-visa' },
  { key: 'visa', label: 'UK visa guidance' },
  { key: 'flights', label: 'Flight & travel' },
  { key: 'accommodation', label: 'Accommodation & settling in' },
  { key: 'employment', label: 'Employment & career' },
  { key: 'post_arrival', label: 'Post-arrival administration' },
  { key: 'integration', label: 'Integration & ongoing support' },
];

export const JOURNEY_LABEL = Object.fromEntries(JOURNEY.map((s) => [s.key, s.label]));

export const DOC_STATUS = {
  pending: { label: 'Awaiting review', cls: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', cls: 'bg-green-50 text-green-700' },
  rejected: { label: 'Needs attention', cls: 'bg-red-50 text-red-700' },
};

export const DOC_LABEL_SUGGESTIONS = [
  'Passport',
  'Academic transcript',
  'Degree certificate',
  'Bank statement',
  'Offer letter',
  'CAS statement',
  'Other',
];

export function formatBytes(n) {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(d) {
  return d
    ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
}

// Opens the tab first (so popup blockers allow it), then points it at the signed link
export async function openSignedUrl(getUrl) {
  const w = window.open('', '_blank');
  try {
    const { url } = await getUrl();
    if (w) w.location.href = url;
    else window.location.href = url;
  } catch (err) {
    if (w) w.close();
    throw err;
  }
}

export function waLinkText(phone, text) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = `234${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function credentialsMessage({ name, email, password }) {
  const first = (name || '').trim().split(/\s+/)[0] || 'there';
  return `Hello ${first}, your BritPath client portal is ready.

Link: ${window.location.origin}/portal/login
Email: ${email}
Temporary password: ${password}

Please log in and change your password. In the portal you can track your journey step by step and upload your documents securely.`;
}