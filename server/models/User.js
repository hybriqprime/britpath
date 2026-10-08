import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'client'], default: 'client' },
    isActive: { type: Boolean, default: true },
    // Bumping this signs the account out of every device
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    // Clients must replace any password someone else set for them
    mustChangePassword: { type: Boolean, default: false },
    passwordResetHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  // $locals.ownerChose: the account owner picked this password themselves
  if (this.role === 'client') this.mustChangePassword = !this.$locals.ownerChose;

  // $locals.keepSessions: owner changed it while signed in, so keep this session
  if (!this.isNew && !this.$locals.keepSessions) this.tokenVersion += 1;

  this.passwordResetHash = undefined;
  this.passwordResetExpires = undefined;
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    mustChangePassword: this.mustChangePassword,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);