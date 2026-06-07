/**
 * Date-based promo fragment picker for DA sheet JSON (e.g. /fragments/promo-scheduler.json).
 *
 * Sheet columns: name, start, end, fragment URL
 * - Rows with empty start and end are defaults (fallback when no dated row matches).
 * - Dated rows match when now >= start and now <= end (open bounds if start/end omitted).
 */

/**
 * @param {unknown} value
 */
function isBlankDate(value) {
  return value == null || String(value).trim() === '';
}

/**
 * @param {Record<string, unknown>} entry
 */
function getFragmentPath(entry) {
  const raw = entry['fragment URL']
    || entry.fragmentUrl
    || entry.fragment
    || entry.url
    || entry.path;
  return raw ? String(raw).trim() : '';
}

/**
 * @param {unknown} value
 * @returns {Date|null}
 */
function parseBoundaryDate(value) {
  if (isBlankDate(value)) return null;
  const d = new Date(String(value).trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {Record<string, unknown>} entry
 */
function isDefaultEntry(entry) {
  return isBlankDate(entry.start) && isBlankDate(entry.end);
}

/**
 * @param {Record<string, unknown>} entry
 * @param {Date} now
 */
function isActiveScheduledEntry(entry, now) {
  const start = parseBoundaryDate(entry.start);
  const end = parseBoundaryDate(entry.end);
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

/**
 * @param {string} path
 */
export function isPromoSchedulerPath(path) {
  if (!path?.trim()) return false;
  const normalized = path.trim().split('?')[0].split('#')[0];
  return /\/promo-scheduler(?:\.json)?$/i.test(normalized);
}

/**
 * @param {unknown} json
 * @returns {Record<string, unknown>[]}
 */
function rowsFromSchedulerJson(json) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object' && Array.isArray(json.data)) return json.data;
  return [];
}

/**
 * Pick fragment path from scheduler JSON already fetched.
 * @param {unknown} json
 * @param {Date} [now]
 * @returns {string|null}
 */
export function pickScheduledFragmentPath(json, now = new Date()) {
  const rows = rowsFromSchedulerJson(json);
  if (!rows.length) return null;

  const defaults = rows.filter(isDefaultEntry);
  const scheduled = rows.filter((row) => !isDefaultEntry(row));
  const active = scheduled.find((row) => isActiveScheduledEntry(row, now));
  const chosen = active || defaults[0];
  return chosen ? getFragmentPath(chosen) || null : null;
}

/**
 * Fetch promo-scheduler.json and return the fragment path to load (.plain.html).
 * @param {string} schedulerPath e.g. /fragments/promo-scheduler.json
 * @param {Date} [now]
 * @returns {Promise<string|null>}
 */
export async function resolvePromoSchedulerFragment(schedulerPath, now = new Date()) {
  const trimmed = schedulerPath.trim();
  const jsonUrl = trimmed.endsWith('.json') ? trimmed : `${trimmed.replace(/\/$/, '')}.json`;
  const resp = await fetch(jsonUrl);
  if (!resp.ok) {
    throw new Error(`promo-scheduler: unable to fetch ${jsonUrl} (${resp.status})`);
  }
  const json = await resp.json();
  return pickScheduledFragmentPath(json, now);
}
