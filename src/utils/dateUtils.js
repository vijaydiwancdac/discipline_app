export function toDayKey(timestamp = Date.now()) {
  return new Date(timestamp).toISOString().split("T")[0];
}

export function normalizeDay(value) {
  if (!value) return toDayKey();
  const date = new Date(value);
  return toDayKey(date.getTime());
}

export function daysAgo(index) {
  const date = new Date();
  date.setDate(date.getDate() - index);
  return toDayKey(date.getTime());
}

export function getIntervalDays(count) {
  return Array.from({ length: count }, (_, index) => daysAgo(count - 1 - index));
}
