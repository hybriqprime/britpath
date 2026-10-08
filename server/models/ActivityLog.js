import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    role: { type: String },
    action: { type: String, required: true, index: true },
    target: { type: String, maxlength: 300 },
    ip: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ createdAt: -1 });
// Keep two years of history
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 730 });

const ActivityLog = mongoose.model('ActivityLog', activitySchema);
export default ActivityLog;

// Never throws: logging must not break the request
export async function logActivity(req, action, extra = {}) {
  try {
    await ActivityLog.create({
      actor: req.user?._id ?? extra.actor,
      actorName: req.user?.name ?? extra.actorName,
      role: req.user?.role ?? extra.role,
      action,
      target: extra.target,
      ip: req.ip,
      meta: extra.meta,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}