/** Server-authoritative NPR ticket pricing. Never accept client totals. */
export const BOOKING_FEE_PER_SEAT = 25;
export const VAT_RATE = 0.13;

export const priceForSeat = (seat, basePrice) => {
  const base = Number(basePrice);
  if (!Number.isFinite(base) || base < 1) return 0;
  if (seat.startsWith('A')) return Math.round(base * 1.35);
  if (/^[BCD]/.test(seat)) return Math.round(base * 1.15);
  return Math.round(base);
};

export const calculateBookingTotals = (seats, basePrice) => {
  const seatPrices = seats.map(seat => priceForSeat(seat, basePrice));
  const subtotal = seatPrices.reduce((sum, price) => sum + price, 0);
  const bookingFee = seats.length * BOOKING_FEE_PER_SEAT;
  const tax = Math.round(subtotal * VAT_RATE);
  const totalAmount = subtotal + bookingFee + tax;
  return { seatPrices, subtotal, bookingFee, tax, totalAmount };
};
