let locked = true;
let onUnlockCallback = () => {};
let onSetPinCallback = () => {};

const lockScreen = document.getElementById("lockScreen");
const lockTitle = document.getElementById("lockTitle");
const lockMessage = document.getElementById("lockMessage");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pinInput");
const pinSubmit = document.getElementById("pinSubmit");
const lockAction = document.getElementById("lockAction");
const pinToggle = document.getElementById("pinToggle");

export function initLockScreen({ onUnlock, onSetPin }) {
  onUnlockCallback = onUnlock;
  onSetPinCallback = onSetPin;

  pinForm.addEventListener("submit", async event => {
    event.preventDefault();
    const pin = pinInput.value.trim();
    if (!pin || pin.length < 4) return;

    if (pinToggle.checked) {
      await onSetPinCallback(pin);
      locked = false;
      hideLockScreen();
      return;
    }

    const success = await onUnlockCallback(pin);
    if (success) {
      locked = false;
      hideLockScreen();
    } else {
      lockMessage.textContent = "PIN did not match. Try again.";
      pinInput.value = "";
      pinInput.focus();
    }
  });
}

export function openLockScreen({ mode = "unlock" }) {
  lockScreen.classList.remove("hidden");
  pinInput.value = "";
  pinToggle.checked = mode === "setup";
  lockTitle.textContent = mode === "setup" ? "Create PIN" : "Enter PIN";
  lockAction.textContent = mode === "setup" ? "Create lock" : "Unlock";
  lockMessage.textContent = mode === "setup"
    ? "Protect private habits with a 4-digit PIN."
    : "Enter your PIN to view private habits.";
  pinInput.focus();
}

export function hideLockScreen() {
  lockScreen.classList.add("hidden");
}

export function isLocked() {
  return locked;
}
