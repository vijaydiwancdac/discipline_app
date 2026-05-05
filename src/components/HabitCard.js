export function createHabitCard({ habit, logs, unlocked, metrics, handlers }) {
  const card = document.createElement("article");
  card.className = "habit-card";

  const riskLabel = {
    low: "Safe",
    medium: "Watch",
    high: "Alert"
  }[metrics.risk] || "Ready";

  const privateClass = habit.isPrivate && !unlocked ? "private-locked" : "";

  card.innerHTML = `
    <div class="habit-card-header ${privateClass}">
      <div class="habit-meta">
        <span class="habit-icon">${habit.icon || "💡"}</span>
        <div>
          <h3>${habit.name}</h3>
          <p class="habit-subtitle">Streak ${metrics.streak} • ${metrics.successRate}%</p>
        </div>
      </div>
      <div class="habit-state ${metrics.risk}">${riskLabel}</div>
    </div>

    <div class="habit-card-body ${privateClass}">
      <div class="habit-status">
        <button class="log-btn done" data-action="done">✔</button>
        <button class="log-btn miss" data-action="miss">❌</button>
      </div>
      <div class="habit-summary">
        <span>${metrics.misses} misses</span>
        <span>${metrics.last7.join("")}</span>
      </div>
    </div>

    <div class="habit-footer ${privateClass}">
      <button class="tertiary-btn" data-action="edit">Edit</button>
      <button class="tertiary-btn" data-action="delete">Delete</button>
    </div>
  `;

  card.querySelectorAll("button").forEach(button => {
    const action = button.dataset.action;
    if (!action) return;
    button.addEventListener("click", () => {
      if (action === "done") handlers.onLog(habit.id, "done");
      if (action === "miss") handlers.onLog(habit.id, "miss");
      if (action === "edit") handlers.onEdit(habit);
      if (action === "delete") handlers.onDelete(habit.id);
    });
  });

  if (habit.isPrivate && !unlocked) {
    const overlay = document.createElement("div");
    overlay.className = "private-overlay";
    overlay.innerHTML = `<span>Private habit</span><button class="secondary-btn unlock-button">Unlock</button>`;
    overlay.querySelector(".unlock-button").addEventListener("click", handlers.onRequireUnlock);
    card.appendChild(overlay);
  }

  return card;
}
