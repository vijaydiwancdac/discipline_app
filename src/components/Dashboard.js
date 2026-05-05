import { getLogs } from "../services/storage.js";
import { getStreak, getSuccessRate, getWeeklyChartData, getMonthlyChartData, countMisses, getRisk, isLoggedToday } from "../services/analytics.js";
import { createHabitCard } from "./HabitCard.js";

export function renderDashboard({ data, unlocked, onLog, onEdit, onDelete, onRequireUnlock }) {
  const habitList = document.getElementById("habitList");
  habitList.innerHTML = "";

  if (!data.habits.length) {
    habitList.innerHTML = "<div class=\"empty-state\">Add a habit to start building your streak.</div>";
    return;
  }

  data.habits.forEach(habit => {
    const logs = getLogs(habit.id);
    const streak = getStreak(logs);
    const successRate = getSuccessRate(logs);
    const weekly = getWeeklyChartData(logs);
    const monthly = getMonthlyChartData(logs);
    const misses = countMisses(logs);
    const risk = getRisk(logs);
    const last7 = weekly.map(value => {
      if (value === 1) return "✅";
      if (value === 0) return "❌";
      return "▫️";
    });

    const metrics = { streak, successRate, risk, misses, last7 };
    const card = createHabitCard({
      habit,
      logs,
      unlocked,
      metrics,
      handlers: {
        onLog,
        onEdit,
        onDelete,
        onRequireUnlock
      }
    });

    habitList.appendChild(card);
  });
}

export function renderSummary(data) {
  const summary = document.getElementById("dashboardSummary");
  if (!summary) return;

  const totalHabits = data.habits.length;
  const completedToday = data.habits.filter(habit => isLoggedToday(getLogs(habit.id))).length;
  summary.innerHTML = `<span>${completedToday}/${totalHabits} completed today</span>`;
}
