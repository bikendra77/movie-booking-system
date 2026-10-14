import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  movieId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  moviePoster: { type: String, required: true },
  showtimeId: { type: String, required: true, index: true },
  theaterName: { type: String, required: true },
  screenName: { type: String, required: true },
  screenFormat: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  seats: { type: [String], required: true },
  seatTier: { type: String, required: true },
  subtotal: { type: Number, required: true },
  bookingFee: { type: Number, required: true },
  tax: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['pay_at_counter'], default: 'pay_at_counter' },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed', index: true }
}, { timestamps: true });

bookingSchema.virtual('id').get(function getId() {
  return this.bookingCode;
});

bookingSchema.set('toJSON', {
  virtuals: true,
  transform(_document, result) {
    result.id = result.bookingCode;
    delete result._id;
    delete result.__v;
    delete result.createdAt;
    delete result.updatedAt;
    return result;
  }
});

export const Booking = mongoose.model('Booking', bookingSchema);
