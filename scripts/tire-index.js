/**
 * Client-side tire catalog index (DA sheet JSON at /fragments/tire-index.json).
 * Powers the tire-search block — similar to discounttire.com/search?text=michelin.
 */

export const DEFAULT_TIRE_INDEX = '/fragments/tire-index.json';

/**
 * @param {string} source
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchTireIndex(source = DEFAULT_TIRE_INDEX) {
  const response = await fetch(source);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('tire-index: unable to fetch', source, response.status);
    return [];
  }
  const json = await response.json();
  if (!json?.data) return [];
  return json.data;
}

/**
 * Active query from URL (`?text=` matches DT; `?q=` supported for compatibility).
 * @returns {string}
 */
export function getSearchQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('text') || params.get('q') || '').trim();
}

/**
 * @param {string} value
 * @returns {string[]}
 */
export function tokenizeQuery(value) {
  return value.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * @param {Record<string, unknown>} tire
 * @returns {string}
 */
function tireSearchBlob(tire) {
  return [
    tire.brand,
    tire.name,
    tire.category,
    tire.type,
    tire.size,
    tire.keywords,
    tire.sku,
  ].filter(Boolean).join(' ').toLowerCase();
}

/**
 * @param {Record<string, unknown>[]} tires
 * @param {string} query
 * @param {{ brands?: string[], categories?: string[] }} [filters]
 * @returns {Record<string, unknown>[]}
 */
export function filterTires(tires, query, filters = {}) {
  const terms = tokenizeQuery(query);
  const brands = (filters.brands || []).map((b) => b.toLowerCase());
  const categories = (filters.categories || []).map((c) => c.toLowerCase());

  return tires.filter((tire) => {
    if (brands.length && !brands.includes(String(tire.brand || '').toLowerCase())) {
      return false;
    }
    if (categories.length && !categories.includes(String(tire.category || '').toLowerCase())) {
      return false;
    }
    if (!terms.length) return true;
    const blob = tireSearchBlob(tire);
    return terms.every((term) => blob.includes(term));
  });
}

/**
 * @param {Record<string, unknown>[]} tires
 * @param {string} sortBy
 * @returns {Record<string, unknown>[]}
 */
export function sortTires(tires, sortBy) {
  const items = [...tires];
  const byName = (a, b) => String(a.name).localeCompare(String(b.name));
  switch (sortBy) {
    case 'price-asc':
      return items.sort((a, b) => Number(a.price) - Number(b.price) || byName(a, b));
    case 'price-desc':
      return items.sort((a, b) => Number(b.price) - Number(a.price) || byName(a, b));
    case 'rating-desc':
      return items.sort((a, b) => Number(b.rating) - Number(a.rating) || byName(a, b));
    case 'best-match':
    default:
      return items.sort((a, b) => Number(b.rank || 0) - Number(a.rank || 0) || byName(a, b));
  }
}

/**
 * @param {Record<string, unknown>[]} tires
 * @returns {{ brands: string[], categories: string[] }}
 */
export function getFilterFacets(tires) {
  const brands = new Set();
  const categories = new Set();
  tires.forEach((tire) => {
    if (tire.brand) brands.add(String(tire.brand));
    if (tire.category) categories.add(String(tire.category));
  });
  return {
    brands: [...brands].sort(),
    categories: [...categories].sort(),
  };
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

/**
 * @param {number} value
 * @param {number} [reviews]
 * @returns {string}
 */
export function formatRating(value, reviews) {
  const rating = Number(value);
  if (Number.isNaN(rating)) return '';
  const count = reviews ? ` (${Number(reviews).toLocaleString()})` : '';
  return `${rating.toFixed(1)}${count}`;
}
