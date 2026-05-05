let currentHabit = null;
let onSaveCallback = () => {};

const modal = document.getElementById("modalBackdrop");
const form = document.getElementById("habitForm");
const titleEl = document.getElementById("modalTitle");
const nameInput = document.getElementById("habitName");
const iconInput = document.getElementById("habitIcon");
const privateInput = document.getElementById("habitPrivate");
const closeButton = document.getElementById("closeModal");

function resetForm() {
  currentHabit = null;
  titleEl.textContent = "Add habit";
  form.reset();
  privateInput.checked = false;
}

export function initHabitForm({ onSave }) {
  onSaveCallback = onSave;

  closeButton.addEventListener("click", closeHabitForm);
  modal.addEventListener("click", event => {
    if (event.target === modal) closeHabitForm();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    const habit = {
      id: currentHabit ? currentHabit.id : `habit_${Date.now()}`,
      name,
      icon: iconInput.value.trim() || "💡",
      isPrivate: privateInput.checked,
      createdAt: currentHabit ? currentHabit.createdAt : new Date().toISOString()
    };

    onSaveCallback(habit);
    closeHabitForm();
  });
}

export function openHabitForm(habit = null) {
  currentHabit = habit;
  if (habit) {
    titleEl.textContent = "Edit habit";
    nameInput.value = habit.name;
    iconInput.value = habit.icon || "";
    privateInput.checked = habit.isPrivate;
  } else {
    resetForm();
  }

  modal.classList.remove("hidden");
  nameInput.focus();
}

export function closeHabitForm() {
  modal.classList.add("hidden");
  resetForm();
}
