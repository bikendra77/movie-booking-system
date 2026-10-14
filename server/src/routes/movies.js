import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { Movie } from '../models/Movie.js';
import { Showtime } from '../models/Showtime.js';
import { Theater } from '../models/Theater.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const editableFields = [
  'title', 'tagline', 'poster', 'backdrop', 'genre', 'rating', 'votes', 'duration',
  'durationMinutes', 'releaseDate', 'language', 'formats', 'certificate', 'director',
  'cast', 'synopsis', 'status', 'featured', 'dataNotes', 'posterSource'
];
const isDateOnly = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const validateMovie = (body, partial = false) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Movie details must be a JSON object.');
  const movie = {};
  for (const field of ['title', 'duration', 'releaseDate', 'language']) {
    if (body[field] === undefined && partial) continue;
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > 200) {
      throw new HttpError(400, `${field} is required and must be at most 200 characters.`);
    }
    movie[field] = body[field].trim();
  }
  if (body.releaseDate !== undefined && !isDateOnly(body.releaseDate)) {
    throw new HttpError(400, 'releaseDate must use YYYY-MM-DD format.');
  }
  for (const field of ['poster', 'backdrop']) {
    if (body[field] === undefined && partial) continue;
    let url;
    try {
      url = new URL(body[field]);
    } catch {
      throw new HttpError(400, `${field} must be a valid HTTPS or HTTP URL.`);
    }
    if (!['https:', 'http:'].includes(url.protocol)) throw new HttpError(400, `${field} must be a valid HTTPS or HTTP URL.`);
    movie[field] = url.toString();
  }
  for (const field of ['genre', 'cast', 'formats']) {
    if (body[field] === undefined && partial) continue;
    const list = body[field] === undefined && !partial ? [] : body[field];
    if (!Array.isArray(list) || list.length > 30 || !list.every(
      value => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80
    )) {
      throw new HttpError(400, `${field} must be a list of up to 30 non-empty strings.`);
    }
    movie[field] = [...new Set(list.map(value => value.trim()))];
  }
  if (!partial && (!movie.formats || movie.formats.length === 0)) movie.formats = ['2D'];
  if (!partial && movie.genre === undefined) movie.genre = [];
  if (!partial && movie.cast === undefined) movie.cast = [];
  if (body.synopsis !== undefined) {
    if (typeof body.synopsis !== 'string' || body.synopsis.length > 5000) throw new HttpError(400, 'synopsis must be at most 5,000 characters.');
    movie.synopsis = body.synopsis.trim();
  }
  if (body.status !== undefined) {
    if (!['now_showing', 'coming_soon'].includes(body.status)) throw new HttpError(400, 'status is not valid.');
    movie.status = body.status;
  }
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 10) throw new HttpError(400, 'rating must be between 0 and 10.');
    movie.rating = rating;
  }
  for (const field of ['durationMinutes']) {
    if (body[field] === undefined) continue;
    const value = Number(body[field]);
    if (!Number.isInteger(value) || value < 0 || value > 1000) throw new HttpError(400, `${field} must be a valid positive number.`);
    movie[field] = value;
  }
  for (const field of ['tagline', 'votes', 'certificate', 'director']) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string' || body[field].length > 200) throw new HttpError(400, `${field} must be at most 200 characters.`);
    movie[field] = body[field].trim();
  }
  if (body.dataNotes !== undefined) {
    if (typeof body.dataNotes !== 'string' || body.dataNotes.length > 2000) {
      throw new HttpError(400, 'dataNotes must be at most 2,000 characters.');
    }
    movie.dataNotes = body.dataNotes.trim();
  }
  if (body.posterSource !== undefined) {
    if (typeof body.posterSource !== 'string' || body.posterSource.length > 500) {
      throw new HttpError(400, 'posterSource must be at most 500 characters.');
    }
    movie.posterSource = body.posterSource.trim();
  }
  if (body.featured !== undefined) {
    if (typeof body.featured !== 'boolean' && body.featured !== 'true' && body.featured !== 'false') {
      throw new HttpError(400, 'featured must be a boolean.');
    }
    movie.featured = body.featured === true || body.featured === 'true';
  }
  for (const field of editableFields) {
    if (body[field] !== undefined && movie[field] === undefined) throw new HttpError(400, `${field} is invalid.`);
  }
  return movie;
};

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  if (['now_showing', 'coming_soon'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.genre && req.query.genre !== 'All') {
    filter.genre = req.query.genre;
  }
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const search = escapeRegex(req.query.search.trim().slice(0, 100));
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { director: { $regex: search, $options: 'i' } },
      { cast: { $regex: search, $options: 'i' } }
    ];
  }
  // Optional strict city filter: only titles with a scheduled showtime in that city.
  // Default catalogue browsing omits this so worldwide titles remain visible without
  // inventing Nepal cinema availability.
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  const localOnly = req.query.localOnly === 'true' || req.query.localOnly === '1';
  if (city && localOnly) {
    const theaterIds = await Theater.distinct('_id', { city });
    if (theaterIds.length === 0) return res.json([]);
    const movieIds = await Showtime.distinct('movieId', { theaterId: { $in: theaterIds } });
    filter._id = { $in: movieIds };
  }
  const movies = await Movie.find(filter).sort({ featured: -1, releaseDate: -1, createdAt: -1 });
  res.json(movies);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new HttpError(404, 'Movie not found.');
  res.json(movie);
}));

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const movie = await Movie.create({ ...validateMovie(req.body), _id: randomUUID() });
  res.status(201).json(movie);
}));

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const fields = validateMovie(req.body, true);
  if (Object.keys(fields).length === 0) throw new HttpError(400, 'Provide at least one movie field to update.');
  const movie = await Movie.findByIdAndUpdate(req.params.id, fields, {
    new: true,
    runValidators: true
  });
  if (!movie) throw new HttpError(404, 'Movie not found.');
  res.json(movie);
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new HttpError(404, 'Movie not found.');
  if (await Showtime.exists({ movieId: movie.id })) {
    throw new HttpError(409, 'Remove this movie’s showtimes before deleting it.');
  }
  await movie.deleteOne();
  res.status(204).end();
}));

export default router;
