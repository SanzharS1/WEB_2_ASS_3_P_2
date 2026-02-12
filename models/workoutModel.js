function isValidISODate(value) {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [y, m, d] = value.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function validateWorkout(body) {
  const { name, duration, type, intensity, calories, date, notes, status } = body || {};

  if (!name || typeof name !== 'string') return 'Invalid name';
  if (duration === undefined || Number.isNaN(Number(duration)) || Number(duration) <= 0) return 'Invalid duration';
  if (!type || typeof type !== 'string') return 'Invalid type';

  if (!intensity || typeof intensity !== 'string') return 'Invalid intensity';
  if (calories === undefined || Number.isNaN(Number(calories)) || Number(calories) < 0) return 'Invalid calories';

  if (!isValidISODate(date)) return 'Invalid date (use YYYY-MM-DD)';

  if (notes !== undefined && typeof notes !== 'string') return 'Invalid notes';
  if (!status || typeof status !== 'string') return 'Invalid status';

  return null;
}

module.exports = { validateWorkout };
