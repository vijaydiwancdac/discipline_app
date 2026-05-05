import { loadData, addHabit, updateHabit, deleteHabit, setLogEntry, getAllData, updateSettings } from "./services/storage.js";
import { hasPin, setPin, verifyPin } from "./services/auth.js";
import { scheduleDailyReminder, requestNotificationPermission, updateReminderSettings } from "./services/notification.js";
import { initHabitForm, openHabitForm } from "./components/HabitForm.js";
import { initLockScreen, openLockScreen, hideLockScreen } from "./components/LockScreen.js";
import { initChartView, updateCharts } from "./components/ChartView.js";
import { renderDashboard, renderSummary } from "./components/Dashboard.js";
import { getIntervalDays } from "./utils/dateUtils.js";

const addHabitButton = document.getElementById("addHabitButton");
const analyticsToggle = document.getElementById("analyticsToggle");
const analyticsPanel = document.getElementById("analyticsPanel");
const closeAnalyticsBtn = document.getElementById("closeAnalyticsBtn");
const lockButton = document.getElementById("lockButton");
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const remindersEnabledInput = document.getElementById("remindersEnabled");
const reminderTimeInput = document.getElementById("reminderTime");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

let appData = loadData();
let unlocked = false;

function getHabitData() {
  return loadData();
}

function refreshApp() {
  appData = getHabitData();
  renderDashboard({
    data: appData,
    unlocked,
    onLog: handleLog,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRequireUnlock: requestUnlock
  });
  renderSummary(appData);
  updateChartsForApp();
  syncSettingsUI();
}

function updateChartsForApp() {
  const keys7 = getIntervalDays(7);
  const keys30 = getIntervalDays(30);
  const habitLogs = appData.habits.map(habit => ({ id: habit.id, logs: getAllData().logs[habit.id] || [] }));

  const buildSeries = days => days.map(day => {
    const totals = habitLogs.reduce(
      (acc, { logs }) => {
        const status = logs.find(item => item.date === day || item.timestamp?.startsWith(day))?.status;
        if (status === "done") acc.done += 1;
        if (status === "miss") acc.miss += 1;
        return acc;
      },
      { done: 0, miss: 0 }
    );

    return totals.done + totals.miss === 0 ? null : totals.done / (totals.done + totals.miss);
  });

  updateCharts({
    weekly: buildSeries(keys7),
    monthly: buildSeries(keys30),
    labels: { weekly: keys7.map(day => day.slice(5)), monthly: keys30.map(day => day.slice(5)) }
  });
}

function requestUnlock() {
  openLockScreen({ mode: "unlock" });
}

function handleAddHabitClick() {
  openHabitForm();
}

function handleSaveHabit(habit) {
  const existing = appData.habits.find(item => item.id === habit.id);
  if (existing) {
    updateHabit(habit.id, habit);
  } else {
    addHabit(habit);
  }
  refreshApp();
}

function handleEdit(habit) {
  openHabitForm(habit);
}

function handleDelete(id) {
  if (!confirm("Delete this habit?")) return;
  deleteHabit(id);
  refreshApp();
}

function handleLog(id, status) {
  const date = new Date().toISOString().split("T")[0];
  setLogEntry(id, {
    timestamp: new Date().toISOString(),
    date,
    status
  });
  refreshApp();
}

function syncSettingsUI() {
  const settings = getAllData().settings;
  remindersEnabledInput.checked = settings.remindersEnabled;
  reminderTimeInput.value = settings.reminderTime;
}

function saveSettings() {
  const enabled = remindersEnabledInput.checked;
  const time = reminderTimeInput.value || "21:00";
  updateReminderSettings({ remindersEnabled: enabled, reminderTime: time });
  refreshApp();
  alert("Reminder settings saved.");
}

function toggleAnalytics() {
  analyticsPanel.classList.toggle("hidden");
}

function toggleSettings() {
  settingsPanel.classList.toggle("hidden");
}

async function initializeLockState() {
  const pinExists = await hasPin();
  if (!pinExists) {
    openLockScreen({ mode: "setup" });
    return;
  }

  const privateHabitExists = appData.habits.some(habit => habit.isPrivate);
  if (privateHabitExists) {
    openLockScreen({ mode: "unlock" });
  } else {
    unlocked = false;
  }
}

async function init() {
  initHabitForm({ onSave: handleSaveHabit });
  initLockScreen({
    onUnlock: async pin => {
      const success = await verifyPin(pin);
      if (success) {
        unlocked = true;
        refreshApp();
      }
      return success;
    },
    onSetPin: async pin => {
      await setPin(pin);
      unlocked = true;
      refreshApp();
    }
  });

  initChartView();
  syncSettingsUI();

  addHabitButton.addEventListener("click", handleAddHabitClick);
  analyticsToggle.addEventListener("click", toggleAnalytics);
  closeAnalyticsBtn.addEventListener("click", toggleAnalytics);
  lockButton.addEventListener("click", () => openLockScreen({ mode: "unlock" }));
  settingsButton.addEventListener("click", toggleSettings);
  closeSettingsBtn.addEventListener("click", toggleSettings);
  saveSettingsBtn.addEventListener("click", saveSettings);

  analyticsPanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      console.warn("Service worker registration failed.");
    });
  }

  await requestNotificationPermission();
  scheduleDailyReminder();
  await initializeLockState();
  refreshApp();
}

window.addEventListener("DOMContentLoaded", init);
