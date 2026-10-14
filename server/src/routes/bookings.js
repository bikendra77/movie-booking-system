import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { Booking } from '../models/Booking.js';
import { Showtime } from '../models/Showtime.js';
import { Movie } from '../models/Movie.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { assertBookableSeats } from '../lib/seats.js';
import { calculateBookingTotals } from '../lib/pricing.js';
import { isShowtimeInFuture } from '../lib/nepalTime.js';

const router = Router();

const releaseSeats = async (booking) => {
  await Showtime.updateOne(
    { _id: booking.showtimeId },
    { $pull: { bookedSeats: { $in: booking.seats } } }
  );
};

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { userId: String(req.user.id) };
  res.json(await Booking.find(filter).sort({ createdAt: -1 }));
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { bookingCode: req.params.id }
    : { bookingCode: req.params.id, userId: String(req.user.id) };
  const booking = await Booking.findOne(filter);
  if (!booking) throw new HttpError(404, 'Booking not found.');
  res.json(booking);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const {
    showtimeId,
    seats,
    customerName,
    customerEmail,
    customerPhone
  } = req.body || {};

  // Never trust client pricing or booking status fields
  if (req.body?.totalAmount !== undefined || req.body?.subtotal !== undefined
    || req.body?.status !== undefined || req.body?.bookingFee !== undefined
    || req.body?.tax !== undefined || req.body?.userId !== undefined) {
    throw new HttpError(400, 'Price and booking status are calculated by the server.');
  }

  if (typeof showtimeId !== 'string' || !showtimeId.trim()) {
    throw new HttpError(400, 'Choose between 1 and 8 seats for a showtime.');
  }
  const seatError = assertBookableSeats(seats);
  if (seatError) throw new HttpError(400, seatError);

  if (customerPhone !== undefined && (typeof customerPhone !== 'string' || customerPhone.length > 30)) {
    throw new HttpError(400, 'Enter a valid phone number.');
  }
  if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.trim().length > 100) {
    throw new HttpError(400, 'Enter a valid ticket holder name.');
  }
  if (typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new HttpError(400, 'Enter a valid ticket contact email.');
  }

  const initialShowtime = await Showtime.findById(showtimeId.trim());
  if (!initialShowtime) throw new HttpError(404, 'Showtime not found.');
  if (!isShowtimeInFuture(initialShowtime)) {
    throw new HttpError(409, 'This showtime has already started and can no longer be booked.');
  }
  const movie = await Movie.findById(initialShowtime.movieId);
  if (!movie) throw new HttpError(404, 'The movie for this showtime is no longer available.');

  if (!isShowtimeInFuture(initialShowtime)) {
    throw new HttpError(409, 'This showtime has already started and can no longer be booked.');
  }
  const showtime = await Showtime.findOneAndUpdate(
    { _id: showtimeId.trim(), bookedSeats: { $nin: seats } },
    { $addToSet: { bookedSeats: { $each: seats } } },
    { new: true }
  );
  if (!showtime) {
    throw new HttpError(409, 'At least one selected seat was just booked. Please choose different seats.');
  }

  const { subtotal, bookingFee, tax, totalAmount } = calculateBookingTotals(seats, showtime.basePrice);
  const bookingCode = `CW-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;

  try {
    const booking = await Booking.create({
      bookingCode,
      userId: String(req.user.id),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: typeof customerPhone === 'string' ? customerPhone.trim() : req.user.phone,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      showtimeId: showtime.id,
      theaterName: showtime.theaterName,
      screenName: showtime.screenName,
      screenFormat: showtime.screenFormat,
      date: showtime.date,
      time: showtime.time,
      seats,
      seatTier: seats.some(seat => seat.startsWith('A')) ? 'VIP' : 'Cinema',
      subtotal,
      bookingFee,
      tax,
      totalAmount,
      paymentMethod: 'pay_at_counter',
      status: 'Confirmed'
    });
    res.status(201).json(booking);
  } catch (error) {
    await Showtime.updateOne(
      { _id: showtimeId.trim() },
      { $pull: { bookedSeats: { $in: seats } } }
    );
    throw error;
  }
}));

router.patch('/:id/cancel', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { bookingCode: req.params.id }
    : { bookingCode: req.params.id, userId: String(req.user.id) };
  const booking = await Booking.findOne(filter);
  if (!booking) throw new HttpError(404, 'Booking not found.');
  if (booking.status === 'Cancelled') {
    throw new HttpError(409, 'This booking has already been cancelled.');
  }
  booking.status = 'Cancelled';
  await booking.save();
  await releaseSeats(booking);
  res.json(booking);
}));

router.patch('/:id/status', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['Confirmed', 'Cancelled'].includes(status)) {
    throw new HttpError(400, 'Status must be Confirmed or Cancelled.');
  }
  const booking = await Booking.findOne({ bookingCode: req.params.id });
  if (!booking) throw new HttpError(404, 'Booking not found.');
  if (booking.status !== status) {
    if (status === 'Cancelled') {
      booking.status = status;
      await booking.save();
      await releaseSeats(booking);
    } else {
      const showtime = await Showtime.findOneAndUpdate(
        { _id: booking.showtimeId, bookedSeats: { $nin: booking.seats } },
        { $addToSet: { bookedSeats: { $each: booking.seats } } },
        { new: true }
      );
      if (!showtime) throw new HttpError(409, 'Those seats have since been booked and cannot be restored.');
      booking.status = status;
      await booking.save();
    }
  }
  res.json(booking);
}));

export default router;
