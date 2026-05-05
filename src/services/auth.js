import { sha256 } from "../utils/hash.js";
import { getAllData, updateAuth } from "./storage.js";

export async function hasPin() {
  return Boolean(getAllData().auth.pinHash);
}

export async function setPin(pin) {
  const pinHash = await sha256(pin);
  updateAuth({ pinHash });
  return pinHash;
}

export async function verifyPin(pin) {
  const pinHash = await sha256(pin);
  return getAllData().auth.pinHash === pinHash;
}

export function clearPin() {
  updateAuth({ pinHash: "" });
}
