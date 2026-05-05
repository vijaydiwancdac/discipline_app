let data = JSON.parse(localStorage.getItem("disciplineData")) || {
  habits: [],
  logs: {}
};

function saveData() {
  localStorage.setItem("disciplineData", JSON.stringify(data));
}

/* MODAL */
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("habitName").value = "";
}

document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});

/* ADD HABIT */
function addHabit() {
  const name = document.getElementById("habitName").value.trim();
  if (!name) return;

  const id = "h_" + Date.now();

  data.habits.push({ id, name });
  data.logs[id] = [];

  saveData();
  closeModal();
  render();
}

/* DATE */
function today() {
  return new Date().toISOString().split("T")[0];
}

/* LOG HABIT */
function logHabit(id, status) {
  const logs = data.logs[id];

  const existing = logs.find(l => l.date === today());

  if (existing) {
    existing.status = status;
  } else {
    logs.push({ date: today(), status });
  }

  saveData();
  render();
}

/* DELETE HABIT */
function deleteHabit(id) {
  if (!confirm("Delete this habit?")) return;
  data.habits = data.habits.filter(h => h.id !== id);
  delete data.logs[id];
  saveData();
  render();
}

/* STREAK */
function getStreak(id) {
  const logs = (data.logs[id] || []).sort((a,b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let i = 0; i < logs.length; i++) {
    const parts = logs[i].date.split("-");
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const diff = Math.round((current - d) / (1000*60*60*24));

    if (diff === streak && logs[i].status === "done") {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/* LAST 7 DAYS */
function getLast7(id) {
  const logs = data.logs[id] || [];
  const map = {};

  logs.forEach(l => map[l.date] = l.status);

  let arr = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    arr.push(map[key] || "none");
  }

  return arr;
}

/* RENDER */
function render() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  data.habits.forEach(habit => {
    const streak = getStreak(habit.id);
    const last7 = getLast7(habit.id);

    const div = document.createElement("div");
    div.className = "habit";

    div.innerHTML = `
      <div class="top-row">
        <strong>${habit.name}</strong>
        <div class="buttons">
          <button class="btn-done" onclick="logHabit('${habit.id}','done')">✔</button>
          <button class="btn-miss" onclick="logHabit('${habit.id}','miss')">❌</button>
          <button class="btn-delete" onclick="deleteHabit('${habit.id}')">🗑️</button>
        </div>
      </div>

      <div class="streak">🔥 Streak: ${streak}</div>

      <div class="history">
        ${last7.map(s => {
          if (s === "done") return `<div class="dot done"></div>`;
          if (s === "miss") return `<div class="dot miss"></div>`;
          return `<div class="dot"></div>`;
        }).join("")}
      </div>
    `;

    list.appendChild(div);
  });
}

render();

/* PWA SERVICE WORKER */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}