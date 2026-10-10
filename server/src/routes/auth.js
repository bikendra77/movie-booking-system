import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { HttpError } from '../lib/httpError.js';

const router = Router();

const createToken = (user) => jwt.sign(
  { sub: user.id, sessionVersion: user.sessionVersion },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const respondWithUser = (res, user, status = 200) => {
  res.status(status).json({ token: createToken(user), user: user.toJSON() });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone = '' } = req.body;
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    throw new HttpError(400, 'Enter a name between 2 and 100 characters.');
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters long.');
  }
  if (typeof phone !== 'string' || phone.length > 30) {
    throw new HttpError(400, 'Enter a valid phone number.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    phone: phone.trim(),
    role: 'user'
  });
  respondWithUser(res, user, 201);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required.');
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  respondWithUser(res, user);
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $inc: { sessionVersion: 1 } });
  res.status(204).end();
}));

router.get('/users', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
}));

export default router;
