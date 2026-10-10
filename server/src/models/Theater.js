import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  screens: { type: [String], default: [] },
  amenities: { type: [String], default: [] }
}, { timestamps: true });

theaterSchema.set('toJSON', {
  virtuals: true,
  transform(_document, result) {
    delete result._id;
    delete result.__v;
    delete result.createdAt;
    delete result.updatedAt;
    return result;
  }
});

export const Theater = mongoose.model('Theater', theaterSchema);
