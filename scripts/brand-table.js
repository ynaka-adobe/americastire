/**
 * Brand → fragment mapping sheet (e.g. /fragments/brand-table.json).
 *
 * Sheet columns: brand, fragment
 * Used when ?brand= is set on tire search to inject brand-specific content.
 */

export const DEFAULT_BRAND_TABLE = '/fragments/brand-table.json';

/**
 * @param {unknown} json
 * @returns {Record<string, unknown>[]}
 */
function rowsFromBrandTable(json) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object' && Array.isArray(json.data)) return json.data;
  return [];
}

/**
 * @param {Record<string, unknown>} entry
 */
function getFragmentPath(entry) {
  const raw = entry.fragment
    || entry['fragment URL']
    || entry.fragmentUrl
    || entry.url
    || entry.path;
  return raw ? String(raw).trim() : '';
}

/**
 * @param {string} source
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchBrandTable(source = DEFAULT_BRAND_TABLE) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('brand-table: unable to fetch', source, response.status);
    return [];
  }
  const json = await response.json();
  return rowsFromBrandTable(json);
}

/**
 * @param {Record<string, unknown>[]} rows
 * @param {string} brand
 * @returns {string|null}
 */
export function resolveBrandFragmentPath(rows, brand) {
  if (!brand?.trim()) return null;
  const needle = brand.trim().toLowerCase();
  const row = rows.find((entry) => String(entry.brand || '').trim().toLowerCase() === needle);
  return row ? getFragmentPath(row) || null : null;
}

/**
 * Pick fragment path when a single brand filter is active.
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} brands
 * @returns {string|null}
 */
export function resolveBrandFragmentForSelection(rows, brands) {
  if (!brands?.length) return null;
  if (brands.length === 1) return resolveBrandFragmentPath(rows, brands[0]);
  return resolveBrandFragmentPath(rows, brands[0]);
}
