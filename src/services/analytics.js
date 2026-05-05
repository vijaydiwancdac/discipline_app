import { toDayKey, getIntervalDays, normalizeDay } from "../utils/dateUtils.js";

function buildLogByDate(logs) {
  return logs.reduce((map, item) => {
    const key = normalizeDay(item.timestamp || item.date);
    map[key] = item.status;
    return map;
  }, {});
}

export function getStreak(logs) {
  const logMap = buildLogByDate(logs);
  let count = 0;
  while (true) {
    const key = toDayKey(Date.now() - count * 24 * 60 * 60 * 1000);
    if (logMap[key] === "done") {
      count += 1;
    } else {
      break;
    }
  }
  return count;
}

export function getSuccessRate(logs, days = 30) {
  const interval = getIntervalDays(days);
  const logMap = buildLogByDate(logs);
  const actual = interval.map(day => logMap[day]).filter(Boolean);
  if (!actual.length) return 0;
  const doneCount = actual.filter(status => status === "done").length;
  return Math.round((doneCount / actual.length) * 100);
}

export function getWeeklyChartData(logs) {
  const interval = getIntervalDays(7);
  const logMap = buildLogByDate(logs);
  return interval.map(day => {
    const status = logMap[day] || "none";
    return status === "done" ? 1 : status === "miss" ? 0 : null;
  });
}

export function getMonthlyChartData(logs) {
  const interval = getIntervalDays(30);
  const logMap = buildLogByDate(logs);
  return interval.map(day => {
    const status = logMap[day];
    if (status === "done") return 1;
    if (status === "miss") return 0;
    return null;
  });
}

export function countMisses(logs) {
  return logs.filter(item => item.status === "miss").length;
}

export function isLoggedToday(logs) {
  const today = toDayKey();
  return logs.some(item => normalizeDay(item.timestamp || item.date) === today);
}

export function getRisk(logs) {
  const recent = logs.slice(-5).map(item => item.status);
  const missCount = recent.filter(status => status === "miss").length;
  if (missCount >= 3) return "high";
  if (missCount === 2) return "medium";
  return "low";
}
