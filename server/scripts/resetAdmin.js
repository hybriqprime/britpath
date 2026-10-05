import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const run = async () => {
  await connectDB();

  const admins = await User.find({ role: 'admin' }).select('email isActive');
  console.log('Admins in database:');
  admins.forEach((a) => console.log(`- ${a.email} (active: ${a.isActive})`));

  const email = process.env.RESET_EMAIL;
  const newPassword = process.env.NEW_PASSWORD;

  if (email && newPassword) {
    if (newPassword.length < 8) {
      throw new Error('NEW_PASSWORD must be at least 8 characters');
    }
    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user) throw new Error(`No admin found with email ${email}`);

    user.password = newPassword;
    user.isActive = true;
    await user.save();
    console.log(`Password reset for ${email}`);
  } else {
    console.log('No reset done (RESET_EMAIL and NEW_PASSWORD not set).');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});