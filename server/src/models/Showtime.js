import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  _id: { type: String },
  movieId: { type: String, required: true, index: true },
  theaterId: { type: String, required: true, index: true },
  theaterName: { type: String, required: true },
  date: { type: String, required: true, index: true },
  time: { type: String, required: true },
  screenFormat: { type: String, required: true },
  screenName: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 1 },
  bookedSeats: { type: [String], default: [] }
}, { timestamps: true });

showtimeSchema.set('toJSON', {
  virtuals: true,
  transform(_document, result) {
    delete result._id;
    delete result.__v;
    delete result.createdAt;
    delete result.updatedAt;
    return result;
  }
});

export const Showtime = mongoose.model('Showtime', showtimeSchema);
