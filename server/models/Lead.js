import mongoose from 'mongoose';

export const LEAD_STATUSES = [
  'enquiry',
  'qualified',
  'booked',
  'paid',
  'in_progress',
  'arrived',
  'alumni',
  'lost',
];

export const SERVICES = [
  'study',
  'visa',
  'flights',
  'accommodation',
  'employment',
  'post_arrival',
];

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },

    course: { type: String, trim: true, maxlength: 160 },
    level: { type: String, trim: true, maxlength: 60 },
    intake: { type: String, trim: true, maxlength: 60 },
    budget: { type: String, trim: true, maxlength: 80 },
    currentStatus: { type: String, trim: true, maxlength: 160 },
    visaRefusal: { type: Boolean, default: false },
    ukTravelBefore: { type: Boolean, default: false },
    services: [{ type: String, enum: SERVICES }],
    message: { type: String, trim: true, maxlength: 2000 },

    status: { type: String, enum: LEAD_STATUSES, default: 'enquiry', index: true },
    lostReason: { type: String, trim: true, maxlength: 120 },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    source: { type: String, trim: true, default: 'website', maxlength: 60, index: true },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    notes: [noteSchema],

    consent: { type: Boolean, required: true },
    consentAt: { type: Date },
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });

export default mongoose.model('Lead', leadSchema);