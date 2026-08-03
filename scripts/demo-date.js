/**
 * Demo / debug "today" override via `?date=` URL parameter.
 *
 * - `?date=2026-07-01` or `?date=2026-07-01T15:00:00Z` — use that instant for scheduling
 * - Persists in sessionStorage for the rest of the browser tab session
 * - `?date=reset` (or `clear` / `off`) — remove the override
 *
 * Import `getDemoDate()` anywhere that needs "now" for date-based promos.
 * After load, `window.hlx.demoDate` mirrors the API for console debugging.
 */

const STORAGE_KEY = 'hlx-demo-date';

/**
 * @param {string} value
 * @returns {Date|'CLEAR'|null}
 */
function parseDemoDateParam(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === 'reset' || lower === 'clear' || lower === 'off') return 'CLEAR';
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Read `?date=` from the current URL and update sessionStorage.
 * @param {string} [href]
 */
export function syncDemoDateFromUrl(href = window.location.href) {
  const dateParam = new URL(href).searchParams.get('date');
  if (dateParam === null) return;

  const parsed = parseDemoDateParam(dateParam);
  if (parsed === 'CLEAR') {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  if (parsed) {
    sessionStorage.setItem(STORAGE_KEY, parsed.toISOString());
  }
}

/**
 * @returns {boolean}
 */
export function isDemoDateActive() {
  return !!sessionStorage.getItem(STORAGE_KEY);
}

/**
 * Effective "now" for date-based scheduling (promo scheduler, etc.).
 * @returns {Date}
 */
export function getDemoDate() {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const d = new Date(stored);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * @param {string} [iso]
 */
export function setDemoDate(iso) {
  if (!iso) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  const d = new Date(iso);
  if (!Number.isNaN(d.getTime())) {
    sessionStorage.setItem(STORAGE_KEY, d.toISOString());
  }
}

export function clearDemoDate() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Publishes demo date helpers on `window.hlx.demoDate`.
 */
export function registerDemoDateOnWindow() {
  window.hlx = window.hlx || {};
  window.hlx.demoDate = {
    get: getDemoDate,
    isActive: isDemoDateActive,
    set: setDemoDate,
    clear: clearDemoDate,
  };
}
