/** Display-only pricing mirror of server/src/lib/pricing.js. Final charge is always server-calculated. */
export const BOOKING_FEE_PER_SEAT = 25;
export const VAT_RATE = 0.13;

export const priceForSeat = (seatId, basePrice) => {
  const base = Number(basePrice);
  if (!Number.isFinite(base) || base < 1) return 0;
  if (seatId.startsWith('A')) return Math.round(base * 1.35);
  if (/^[BCD]/.test(seatId)) return Math.round(base * 1.15);
  return Math.round(base);
};

export const calculateDisplayTotals = (seats, basePrice) => {
  const seatCount = seats.length;
  const subtotal = seats.reduce((sum, seat) => {
    const price = seat.price ?? priceForSeat(seat.id, basePrice);
    return sum + price;
  }, 0);
  const bookingFee = seatCount * BOOKING_FEE_PER_SEAT;
  const tax = Math.round(subtotal * VAT_RATE);
  const totalAmount = subtotal + bookingFee + tax;
  return { seatCount, subtotal, bookingFee, tax, totalAmount };
};
