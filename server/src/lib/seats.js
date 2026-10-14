/** Cinema seat map: rows A–H, seats 1–12. Kept in sync with the storefront SeatGrid. */
export const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const SEATS_PER_ROW = 12;
export const INACCESSIBLE_SEATS = Object.freeze(['H6', 'H7']);
export const VALID_SEAT = /^[A-H](?:[1-9]|1[0-2])$/;

export const isValidSeatId = (seat) =>
  typeof seat === 'string' && VALID_SEAT.test(seat) && !INACCESSIBLE_SEATS.includes(seat);

export const assertBookableSeats = (seats) => {
  if (!Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
    return 'Choose between 1 and 8 seats for a showtime.';
  }
  if (new Set(seats).size !== seats.length) {
    return 'Duplicate seats are not allowed.';
  }
  if (!seats.every(isValidSeatId)) {
    return 'One or more seat selections are invalid or inaccessible.';
  }
  return null;
};
