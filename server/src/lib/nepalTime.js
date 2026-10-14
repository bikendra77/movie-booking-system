const NEPAL_OFFSET_MINUTES = 5 * 60 + 45;

export const getShowtimeInstant = (date, time) => {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const dateCheck = new Date(Date.UTC(year, month - 1, day));
  if (dateCheck.getUTCFullYear() !== year
    || dateCheck.getUTCMonth() !== month - 1
    || dateCheck.getUTCDate() !== day) return null;

  const match = typeof time === 'string'
    ? time.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i)
    : null;
  if (!match) return null;

  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  const localTimeAsUtc = Date.UTC(year, month - 1, day, hour, Number(match[2]));
  return new Date(localTimeAsUtc - NEPAL_OFFSET_MINUTES * 60_000);
};

export const isShowtimeInFuture = (showtime, now = new Date()) => {
  const instant = getShowtimeInstant(showtime.date, showtime.time);
  return instant !== null && instant.getTime() > now.getTime();
};

export const compareShowtimesByNepalTime = (left, right) => {
  const leftInstant = getShowtimeInstant(left.date, left.time)?.getTime() ?? 0;
  const rightInstant = getShowtimeInstant(right.date, right.time)?.getTime() ?? 0;
  return leftInstant - rightInstant;
};
