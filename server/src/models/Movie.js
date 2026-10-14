import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  poster: { type: String, required: true },
  backdrop: { type: String, required: true },
  genre: { type: [String], default: [] },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  votes: { type: String, default: '' },
  duration: { type: String, required: true },
  durationMinutes: { type: Number, default: 0 },
  releaseDate: { type: String, required: true },
  language: { type: String, required: true },
  formats: { type: [String], default: [] },
  certificate: { type: String, default: 'PG' },
  director: { type: String, default: '' },
  cast: { type: [String], default: [] },
  synopsis: { type: String, default: '' },
  status: { type: String, enum: ['now_showing', 'coming_soon'], default: 'now_showing' },
  featured: { type: Boolean, default: false },
  dataNotes: { type: String, default: '', maxlength: 2000 },
  posterSource: { type: String, default: '', maxlength: 500 }
}, { timestamps: true });

movieSchema.set('toJSON', {
  virtuals: true,
  transform(_document, result) {
    delete result._id;
    delete result.__v;
    delete result.createdAt;
    delete result.updatedAt;
    return result;
  }
});

export const Movie = mongoose.model('Movie', movieSchema);
