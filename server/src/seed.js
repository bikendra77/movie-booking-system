import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Movie } from './models/Movie.js';
import { Theater } from './models/Theater.js';
import { CATALOGUE_MOVIES, NEPAL_THEATERS } from './data/catalogueMovies.js';

const databaseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinewave';
if (!process.env.SEED_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD.length < 8) {
  throw new Error('Set SEED_ADMIN_PASSWORD (at least 8 characters) before seeding.');
}
if (!process.env.SEED_ADMIN_EMAIL) {
  throw new Error('Set SEED_ADMIN_EMAIL before seeding.');
}

const seedCatalogue = process.env.SEED_CATALOGUE !== 'false';

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
  console.log('Created or updated the configured administrator.');

  if (seedCatalogue) {
    for (const movie of CATALOGUE_MOVIES) {
      await Movie.findOneAndUpdate(
        { _id: movie._id },
        { $set: movie },
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`Upserted ${CATALOGUE_MOVIES.length} worldwide catalogue movies (no Nepal showtimes).`);

    for (const theater of NEPAL_THEATERS) {
      await Theater.findOneAndUpdate(
        { _id: theater._id },
        { $set: theater },
        { upsert: true, new: true, runValidators: true }
      );
    }
    console.log(`Upserted ${NEPAL_THEATERS.length} Nepal cinema venues (showtimes left empty for admins).`);
  } else {
    console.log('Skipped catalogue seed (SEED_CATALOGUE=false).');
  }

  console.log('Existing booking and showtime records were left unchanged.');
} catch (error) {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
