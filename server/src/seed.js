import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';

const databaseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinewave';
if (!process.env.SEED_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD.length < 8) {
  throw new Error('Set SEED_ADMIN_PASSWORD (at least 8 characters) before seeding.');
}
if (!process.env.SEED_ADMIN_EMAIL) {
  throw new Error('Set SEED_ADMIN_EMAIL before seeding.');
}

try {
  await mongoose.connect(databaseUri);
  const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: 'CineWave Administrator',
        passwordHash,
        role: 'admin'
      },
      $setOnInsert: { phone: '' }
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log('Created or updated the configured administrator. Existing catalogue and booking records were left unchanged.');
} catch (error) {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
