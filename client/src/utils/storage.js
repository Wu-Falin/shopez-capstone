/**
 * Safe wrappers around localStorage. Some browsers (private mode, blocked
 * storage) throw errors on access; these helpers simply fall back.
 */
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the app keeps working for this visit only.
  }
}
