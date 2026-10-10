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

export const getKathmanduDateLabel = (dateString, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  const date = new Date(`${dateString}T12:00:00+05:45`);
  return new Intl.DateTimeFormat('en-NP', { timeZone: 'Asia/Kathmandu', ...options }).format(date);
};
