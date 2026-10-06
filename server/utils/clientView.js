import { JOURNEY_STAGES } from '../config/journey.js';

export function progressOf(client) {
  const stages = JOURNEY_STAGES.map((s) => {
    const items = client.checklist.filter((i) => i.stage === s.key);
    const done = items.filter((i) => i.done).length;
    return {
      key: s.key,
      label: s.label,
      total: items.length,
      done,
      percent: items.length ? Math.round((done / items.length) * 100) : 0,
    };
  });

  const total = client.checklist.length;
  const done = client.checklist.filter((i) => i.done).length;
  return { overall: total ? Math.round((done / total) * 100) : 0, stages };
}

const itemView = (i) => ({
  id: i._id,
  stage: i.stage,
  title: i.title,
  done: i.done,
  doneAt: i.doneAt || null,
  dueDate: i.dueDate || null,
});

// Never exposes publicId: files are only reachable through signed, expiring links
const docView = (d) => ({
  id: d._id,
  label: d.label,
  stage: d.stage || null,
  format: d.format,
  bytes: d.bytes,
  originalName: d.originalName,
  uploadedBy: d.uploadedBy,
  status: d.status,
  reviewNote: d.reviewNote || '',
  uploadedAt: d.uploadedAt,
});

const base = (client) => ({
  id: client._id,
  package: client.package || '',
  course: client.course || '',
  university: client.university || '',
  intake: client.intake || '',
  currentStage: client.currentStage,
  checklist: client.checklist.map(itemView),
  documents: client.documents.map(docView),
  progress: progressOf(client),
  createdAt: client.createdAt,
});

export function adminView(client, user) {
  return {
    ...base(client),
    user: user
      ? {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
        }
      : null,
    lead: client.lead || null,
    notes: client.notes.map((n) => ({
      id: n._id,
      text: n.text,
      visibleToClient: n.visibleToClient,
      authorName: n.authorName,
      createdAt: n.createdAt,
    })),
  };
}

export function portalView(client, user) {
  return {
    ...base(client),
    user: { name: user.name, email: user.email },
    notes: client.notes
      .filter((n) => n.visibleToClient)
      .map((n) => ({ id: n._id, text: n.text, createdAt: n.createdAt })),
  };
}