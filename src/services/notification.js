import { loadData, updateSettings } from "./storage.js";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export function showReminderNotification() {
  const title = "Discipline reminder";
  const body = "Check your habits and keep your streak alive.";

  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: "/public/icons/icon-192.svg",
        badge: "/public/icons/icon-192.svg"
      });
    }).catch(() => {
      new Notification(title, { body });
    });
  } else if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

let reminderTimer = null;

export function scheduleDailyReminder() {
  if (reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }

  const data = loadData();
  const { remindersEnabled, reminderTime } = data.settings;
  if (!remindersEnabled) return;

  const [hours, minutes] = reminderTime.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  reminderTimer = window.setTimeout(() => {
    showReminderNotification();
    scheduleDailyReminder();
  }, next.getTime() - now.getTime());
}

export function updateReminderSettings(settings) {
  updateSettings(settings);
  scheduleDailyReminder();
}
