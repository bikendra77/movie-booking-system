const kathmanduParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-NP', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
};

export const getKathmanduDate = (offsetDays = 0) => {
  const parts = kathmanduParts(new Date());
  const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + offsetDays));
  return date.toISOString().slice(0, 10);
};

export const getKathmanduShowtimeInstant = (dateString, timeString) => {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  const dateCheck = new Date(Date.UTC(year, month - 1, day));
  if (dateCheck.getUTCFullYear() !== year
    || dateCheck.getUTCMonth() !== month - 1
    || dateCheck.getUTCDate() !== day) return null;

  const match = typeof timeString === 'string'
    ? timeString.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i)
    : null;
  if (!match) return null;

  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return new Date(Date.UTC(year, month - 1, day, hour, Number(match[2])) - (5 * 60 + 45) * 60_000);
};

export const isKathmanduShowtimeInFuture = (showtime, now = new Date()) => {
  const instant = getKathmanduShowtimeInstant(showtime.date, showtime.time);
  return instant !== null && instant.getTime() > now.getTime();
};

export const getKathmanduDateLabel = (dateString, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  const date = new Date(`${dateString}T12:00:00+05:45`);
  return new Intl.DateTimeFormat('en-NP', { timeZone: 'Asia/Kathmandu', ...options }).format(date);
};
