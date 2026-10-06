export const JOURNEY_STAGES = [
  { key: 'school_admission', label: 'School & admission' },
  { key: 'cas_pre_visa', label: 'CAS & pre-visa' },
  { key: 'visa', label: 'UK visa guidance' },
  { key: 'flights', label: 'Flight & travel' },
  { key: 'accommodation', label: 'Accommodation & settling in' },
  { key: 'employment', label: 'Employment & career' },
  { key: 'post_arrival', label: 'Post-arrival administration' },
  { key: 'integration', label: 'Integration & ongoing support' },
];

export const STAGE_KEYS = JOURNEY_STAGES.map((s) => s.key);

// Default checklist given to every new client. Edit per client afterwards.
const TEMPLATES = {
  school_admission: [
    'Complete profile assessment',
    'Shortlist universities and courses',
    'Gather academic documents (transcripts, certificates)',
    'Submit applications',
    'Review offers received',
    'Accept your chosen offer',
  ],
  cas_pre_visa: [
    'Agree your proof of funds plan',
    'Collect required documents',
    'Document review with BritPath',
    'Meet the university pre-CAS requirements',
    'Receive your CAS',
  ],
  visa: [
    'Complete the visa application form',
    'Pay the visa fee and healthcare surcharge',
    'Book and attend your biometrics appointment',
    'Prepare for an interview if you are invited',
    'Track your application and receive the decision',
  ],
  flights: [
    'Research flight options and dates',
    'Book your flights',
    'Plan your airport arrival and first-day transport',
    'Keep essential documents in your hand luggage',
  ],
  accommodation: [
    'Decide your area and budget',
    'Search and shortlist accommodation',
    'Review the tenancy terms before signing',
    'Pay the deposit and confirm your move-in date',
    'Plan your first-week essentials',
  ],
  employment: [
    'Understand your part-time work rights',
    'Prepare a UK-format CV',
    'Start your job search',
    'Learn UK workplace expectations',
  ],
  post_arrival: [
    'Complete university enrolment',
    'Apply for your National Insurance (NI) number if you are working',
    'Open a UK bank account',
    'Register with a GP / NHS',
    'Set up your phone and transport',
  ],
  integration: [
    'Understand key UK systems (council tax, transport, healthcare)',
    'Day-30 check-in with BritPath',
    'Share your feedback or refer a friend',
  ],
};

export function buildChecklist() {
  const items = [];
  for (const stage of STAGE_KEYS) {
    for (const title of TEMPLATES[stage]) {
      items.push({ stage, title, done: false });
    }
  }
  return items;
}