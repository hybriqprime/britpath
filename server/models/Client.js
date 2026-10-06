import mongoose from 'mongoose';
import { STAGE_KEYS } from '../config/journey.js';

const checklistItemSchema = new mongoose.Schema({
  stage: { type: String, enum: STAGE_KEYS, required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  done: { type: Boolean, default: false },
  doneAt: { type: Date },
  dueDate: { type: Date },
});

const documentSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 80 },
  stage: { type: String, enum: STAGE_KEYS },
  publicId: { type: String, required: true },
  format: { type: String, required: true },
  bytes: { type: Number },
  originalName: { type: String, maxlength: 160 },
  uploadedBy: { type: String, enum: ['client', 'admin'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewNote: { type: String, trim: true, maxlength: 300 },
  uploadedAt: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    visibleToClient: { type: Boolean, default: false },
    authorName: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    package: { type: String, trim: true, maxlength: 120 },
    course: { type: String, trim: true, maxlength: 160 },
    university: { type: String, trim: true, maxlength: 160 },
    intake: { type: String, trim: true, maxlength: 60 },
    currentStage: { type: String, enum: STAGE_KEYS, default: 'school_admission' },
    checklist: [checklistItemSchema],
    documents: [documentSchema],
    notes: [noteSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);