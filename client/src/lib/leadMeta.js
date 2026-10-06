export const STAGES = [
  { key: 'enquiry', label: 'Enquiry' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'booked', label: 'Booked' },
  { key: 'paid', label: 'Paid' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'lost', label: 'Lost' },
];

export const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));

export const SERVICE_LABEL = {
  study: 'School & admission',
  visa: 'Visa guidance',
  flights: 'Flights',
  accommodation: 'Accommodation',
  employment: 'Employment',
  post_arrival: 'Post-arrival',
};

// Builds a wa.me link from a stored phone number (handles Nigerian 0801... format)
export function waLink(phone, name = '') {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = `234${digits.slice(1)}`;

  const first = name.trim().split(/\s+/)[0] || 'there';
  const text = `Hello ${first}, this is The BritPath. Thank you for your enquiry about UK study and relocation guidance.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}