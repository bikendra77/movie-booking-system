import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { Showtime } from '../models/Showtime.js';
import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Booking } from '../models/Booking.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const isDateOnly = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const validateShowtime = (body, partial = false) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Showtime details must be a JSON object.');
  const showtime = {};
  for (const field of ['movieId', 'theaterId', 'date', 'time', 'screenFormat', 'screenName']) {
    if (body[field] === undefined && partial) continue;
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > 120) {
      throw new HttpError(400, `${field} is required and must be at most 120 characters.`);
    }
    showtime[field] = body[field].trim();
  }
  if (showtime.date && !isDateOnly(showtime.date)) {
    throw new HttpError(400, 'date must use YYYY-MM-DD format.');
  }
  if (showtime.time && !/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i.test(showtime.time)) {
    throw new HttpError(400, 'time must use a 12-hour Nepal local time such as 07:30 PM.');
  }
  if (body.basePrice !== undefined || !partial) {
    const price = Number(body.basePrice);
    if (!Number.isFinite(price) || price < 1 || price > 10000) {
      throw new HttpError(400, 'Ticket price must be between NPR 1 and NPR 10,000.');
    }
    showtime.basePrice = price;
  }
  return showtime;
};

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  for (const field of ['movieId', 'date', 'theaterId']) {
    if (typeof req.query[field] === 'string' && req.query[field]) {
      filter[field] = req.query[field];
    }
  }
  res.json(await Showtime.find(filter).sort({ date: 1, time: 1 }));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id);
  if (!showtime) throw new HttpError(404, 'Showtime not found.');
  res.json(showtime);
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { movieId, theaterId, date, time, screenFormat, screenName, basePrice } = validateShowtime(req.body);
  const [movie, theater] = await Promise.all([
    Movie.findById(movieId),
    Theater.findById(theaterId)
  ]);
  if (!movie || !theater) throw new HttpError(400, 'Choose an existing movie and cinema.');
  const showtime = await Showtime.create({
    _id: randomUUID(),
    movieId,
    theaterId,
    theaterName: theater.name,
    date: date.trim(),
    time: time.trim(),
    screenFormat: screenFormat.trim(),
    screenName: screenName.trim(),
    basePrice,
    bookedSeats: []
  });
  res.status(201).json(showtime);
}));

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const fields = validateShowtime(req.body, true);
  if (Object.keys(fields).length === 0) throw new HttpError(400, 'Provide at least one showtime field to update.');
  const current = await Showtime.findById(req.params.id);
  if (!current) throw new HttpError(404, 'Showtime not found.');
  if (await Booking.exists({ showtimeId: current.id })) {
    throw new HttpError(409, 'A showtime with booking records cannot be edited.');
  }
  const movieId = fields.movieId || current.movieId;
  const theaterId = fields.theaterId || current.theaterId;
  const [movie, theater] = await Promise.all([
    Movie.findById(movieId),
    Theater.findById(theaterId)
  ]);
  if (!movie || !theater) throw new HttpError(400, 'Choose an existing movie and cinema.');
  Object.assign(current, fields, { theaterName: theater.name });
  await current.save();
  res.json(current);
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const showtime = await Showtime.findById(req.params.id);
  if (!showtime) throw new HttpError(404, 'Showtime not found.');
  if (await Booking.exists({ showtimeId: showtime.id, status: 'Confirmed' })) {
    throw new HttpError(409, 'A showtime with confirmed bookings cannot be deleted.');
  }
  await showtime.deleteOne();
  res.status(204).end();
}));

export default router;
