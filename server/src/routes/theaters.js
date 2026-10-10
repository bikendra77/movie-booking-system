import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { Theater } from '../models/Theater.js';
import { Showtime } from '../models/Showtime.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const validateTheater = (body, partial = false) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Cinema details must be a JSON object.');
  const theater = {};
  for (const field of ['name', 'location', 'city']) {
    if (body[field] === undefined && partial) continue;
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > 120) {
      throw new HttpError(400, `${field} must be a non-empty string of at most 120 characters.`);
    }
    theater[field] = body[field].trim();
  }
  for (const field of ['screens', 'amenities']) {
    if (body[field] === undefined && partial) continue;
    if (!Array.isArray(body[field]) || body[field].length > 30 || !body[field].every(
      value => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80
    )) {
      throw new HttpError(400, `${field} must be a list of up to 30 non-empty strings.`);
    }
    theater[field] = [...new Set(body[field].map(value => value.trim()))];
  }
  return theater;
};

router.get('/stats', asyncHandler(async (_req, res) => {
  const [cities, cinemas] = await Promise.all([
    Theater.distinct('city'),
    Theater.countDocuments()
  ]);
  res.json({ cityCount: cities.length, cinemaCount: cinemas });
}));

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (typeof req.query.city === 'string' && req.query.city.trim()) {
    filter.city = req.query.city.trim();
  }
  res.json(await Theater.find(filter).sort({ city: 1, name: 1 }));
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const theater = await Theater.create({ ...validateTheater(req.body), _id: randomUUID() });
  res.status(201).json(theater);
}));

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const fields = validateTheater(req.body, true);
  if (Object.keys(fields).length === 0) throw new HttpError(400, 'Provide at least one cinema field to update.');
  const theater = await Theater.findByIdAndUpdate(req.params.id, fields, {
    new: true,
    runValidators: true
  });
  if (!theater) throw new HttpError(404, 'Cinema not found.');
  res.json(theater);
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);
  if (!theater) throw new HttpError(404, 'Cinema not found.');
  if (await Showtime.exists({ theaterId: theater.id })) {
    throw new HttpError(409, 'Remove this cinema’s showtimes before deleting it.');
  }
  await theater.deleteOne();
  res.status(204).end();
}));

export default router;
