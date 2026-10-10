import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { Booking } from '../models/Booking.js';
import { Showtime } from '../models/Showtime.js';
import { Movie } from '../models/Movie.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../lib/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const VALID_SEAT = /^[A-G](?:[1-9]|10)$/;
const priceForSeat = (seat, basePrice) => Math.round(basePrice * (seat.startsWith('A') ? 1.35 : /^[BCD]/.test(seat) ? 1.15 : 1));

const releaseSeats = async (booking) => {
  await Showtime.updateOne(
    { _id: booking.showtimeId },
    { $pull: { bookedSeats: { $in: booking.seats } } }
  );
};

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
  res.json(await Booking.find(filter).sort({ createdAt: -1 }));
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { bookingCode: req.params.id }
    : { bookingCode: req.params.id, userId: req.user.id };
  const booking = await Booking.findOne(filter);
  if (!booking) throw new HttpError(404, 'Booking not found.');
  res.json(booking);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { showtimeId, seats, customerName, customerEmail, customerPhone } = req.body;
  if (typeof showtimeId !== 'string' || !Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
    throw new HttpError(400, 'Choose between 1 and 8 seats for a showtime.');
  }
  if (new Set(seats).size !== seats.length || !seats.every(seat => typeof seat === 'string' && VALID_SEAT.test(seat))) {
    throw new HttpError(400, 'One or more seat selections are invalid.');
  }
  if (customerPhone !== undefined && (typeof customerPhone !== 'string' || customerPhone.length > 30)) {
    throw new HttpError(400, 'Enter a valid phone number.');
  }
  if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.trim().length > 100) {
    throw new HttpError(400, 'Enter a valid ticket holder name.');
  }
  if (typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new HttpError(400, 'Enter a valid ticket contact email.');
  }

  const initialShowtime = await Showtime.findById(showtimeId);
  if (!initialShowtime) throw new HttpError(404, 'Showtime not found.');
  const movie = await Movie.findById(initialShowtime.movieId);
  if (!movie) throw new HttpError(404, 'The movie for this showtime is no longer available.');

  const showtime = await Showtime.findOneAndUpdate(
    { _id: showtimeId, bookedSeats: { $nin: seats } },
    { $addToSet: { bookedSeats: { $each: seats } } },
    { new: true }
  );
  if (!showtime) {
    throw new HttpError(409, 'At least one selected seat was just booked. Please choose different seats.');
  }

  const seatPrices = seats.map(seat => priceForSeat(seat, showtime.basePrice));
  const subtotal = seatPrices.reduce((sum, price) => sum + price, 0);
  const bookingFee = seats.length * 25;
  const tax = Math.round(subtotal * 0.13);
  const totalAmount = subtotal + bookingFee + tax;
  const bookingCode = `CW-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;

  try {
    const booking = await Booking.create({
      bookingCode,
      userId: req.user.id,
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
      status: 'Confirmed',
      qrCodeMock: `CINEWAVE-${bookingCode}-${seats.join('-')}`
    });
    res.status(201).json(booking);
  } catch (error) {
    await Showtime.updateOne(
      { _id: showtimeId },
      { $pull: { bookedSeats: { $in: seats } } }
    );
    throw error;
  }
}));

router.patch('/:id/cancel', requireAuth, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin'
    ? { bookingCode: req.params.id }
    : { bookingCode: req.params.id, userId: req.user.id };
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
  const { status } = req.body;
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
