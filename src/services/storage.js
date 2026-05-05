const STORAGE_KEY = "discipline_data_v1";

const DEFAULT_DATA = {
  habits: [],
  logs: {},
  auth: {
    pinHash: ""
  },
  settings: {
    remindersEnabled: false,
    reminderTime: "21:00"
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return clone(DEFAULT_DATA);

  try {
    const parsed = JSON.parse(raw);
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      logs: typeof parsed.logs === "object" && parsed.logs ? parsed.logs : {},
      auth: typeof parsed.auth === "object" && parsed.auth ? parsed.auth : { pinHash: "" },
      settings: typeof parsed.settings === "object" && parsed.settings
        ? parsed.settings
        : clone(DEFAULT_DATA.settings)
    };
  } catch (error) {
    console.warn("Discipline: failed to parse storage, resetting.", error);
    return clone(DEFAULT_DATA);
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateData(updater) {
  const current = loadData();
  const next = updater(clone(current));
  saveData(next);
  return next;
}

export function getHabits() {
  return loadData().habits;
}

export function getLogs(habitId) {
  const data = loadData();
  return data.logs[habitId] || [];
}

export function addHabit(habit) {
  updateData(data => {
    data.habits.push(habit);
    data.logs[habit.id] = [];
    return data;
  });
}

export function updateHabit(id, changes) {
  updateData(data => {
    data.habits = data.habits.map(item => item.id === id ? { ...item, ...changes } : item);
    return data;
  });
}

export function deleteHabit(id) {
  updateData(data => {
    data.habits = data.habits.filter(habit => habit.id !== id);
    delete data.logs[id];
    return data;
  });
}

export function setLogEntry(habitId, entry) {
  updateData(data => {
    const logs = data.logs[habitId] || [];
    const dayKey = entry.date;
    const existing = logs.find(log => log.date === dayKey);

    if (existing) {
      existing.status = entry.status;
      existing.timestamp = entry.timestamp;
    } else {
      logs.push(entry);
    }

    data.logs[habitId] = logs;
    return data;
  });
}

export function updateSettings(settings) {
  updateData(data => {
    data.settings = { ...data.settings, ...settings };
    return data;
  });
}

export function updateAuth(auth) {
  updateData(data => {
    data.auth = { ...data.auth, ...auth };
    return data;
  });
}

export function getAllData() {
  return loadData();
}
