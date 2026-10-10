import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String, default: '', trim: true },
  sessionVersion: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.set('toJSON', {
  virtuals: true,
  transform(_document, result) {
    delete result._id;
    delete result.__v;
    delete result.passwordHash;
    delete result.createdAt;
    delete result.updatedAt;
    return result;
  }
});

export const User = mongoose.model('User', userSchema);
