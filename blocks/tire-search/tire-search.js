import {
  createOptimizedPicture,
  decorateIcons,
  fetchPlaceholders,
} from '../../scripts/aem.js';
import {
  DEFAULT_TIRE_INDEX,
  fetchTireIndex,
  filterTires,
  formatPrice,
  formatRating,
  getFilterFacets,
  getSearchQueryFromUrl,
  sortTires,
} from '../../scripts/tire-index.js';

/**
 * @typedef {object} TireSearchState
 * @property {string} query
 * @property {string} sort
 * @property {string[]} brands
 * @property {string[]} categories
 */

/** @type {Record<string, unknown>[]} */
let catalog = [];

/**
 * @param {URL} url
 * @param {TireSearchState} state
 */
function syncUrl(url, state) {
  if (state.query) {
    url.searchParams.set('text', state.query);
    url.searchParams.delete('q');
  } else {
    url.searchParams.delete('text');
    url.searchParams.delete('q');
  }
  if (state.sort && state.sort !== 'best-match') {
    url.searchParams.set('sort', state.sort);
  } else {
    url.searchParams.delete('sort');
  }
  window.history.replaceState({}, '', url.toString());
}

/**
 * @param {Element} block
 * @returns {TireSearchState}
 */
function readState(block) {
  return {
    query: block.querySelector('.tire-search-input')?.value.trim() || '',
    sort: block.querySelector('.tire-search-sort')?.value || 'best-match',
    brands: [...block.querySelectorAll('.tire-search-filter-brand:checked')].map((el) => el.value),
    categories: [...block.querySelectorAll('.tire-search-filter-category:checked')].map((el) => el.value),
  };
}

/**
 * @param {string[]} terms
 * @param {string} text
 * @returns {DocumentFragment}
 */
function highlightTerms(terms, text) {
  const fragment = document.createDocumentFragment();
  if (!terms.length) {
    fragment.appendChild(document.createTextNode(text));
    return fragment;
  }
  const lower = text.toLowerCase();
  const matches = [];
  terms.forEach((term) => {
    let idx = lower.indexOf(term, 0);
    while (idx >= 0) {
      matches.push({ start: idx, end: idx + term.length });
      idx = lower.indexOf(term, idx + term.length);
    }
  });
  matches.sort((a, b) => a.start - b.start);
  let pos = 0;
  matches.forEach(({ start, end }) => {
    if (start < pos) return;
    if (start > pos) fragment.appendChild(document.createTextNode(text.slice(pos, start)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(start, end);
    fragment.appendChild(mark);
    pos = end;
  });
  if (pos < text.length) fragment.appendChild(document.createTextNode(text.slice(pos)));
  return fragment;
}

/**
 * @param {Record<string, unknown>} tire
 * @param {string[]} terms
 */
function renderCard(tire, terms) {
  const article = document.createElement('article');
  article.className = 'tire-search-card';

  const link = document.createElement('a');
  link.className = 'tire-search-card-link';
  link.href = String(tire.path || '#');

  if (tire.image) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'tire-search-card-image';
    const pic = createOptimizedPicture(
      String(tire.image),
      String(tire.name || ''),
      false,
      [{ width: '320' }, { width: '640' }],
    );
    imageWrap.append(pic);
    link.append(imageWrap);
  }

  const body = document.createElement('div');
  body.className = 'tire-search-card-body';

  if (tire.brand) {
    const brand = document.createElement('p');
    brand.className = 'tire-search-card-brand';
    brand.textContent = String(tire.brand);
    body.append(brand);
  }

  const title = document.createElement('h3');
  title.className = 'tire-search-card-title';
  title.append(highlightTerms(terms, String(tire.name || '')));
  body.append(title);

  const meta = document.createElement('p');
  meta.className = 'tire-search-card-meta';
  meta.textContent = [tire.type, tire.category, tire.size].filter(Boolean).join(' • ');
  body.append(meta);

  if (tire.rating) {
    const rating = document.createElement('p');
    rating.className = 'tire-search-card-rating';
    rating.setAttribute('aria-label', `Rated ${tire.rating} out of 5`);
    rating.innerHTML = `<span class="tire-search-stars" aria-hidden="true">★</span> ${formatRating(Number(tire.rating), Number(tire.reviews))}`;
    body.append(rating);
  }

  if (tire.price) {
    const price = document.createElement('p');
    price.className = 'tire-search-card-price';
    price.innerHTML = `From <strong>${formatPrice(Number(tire.price))}</strong> <span class="tire-search-card-each">/ tire</span>`;
    body.append(price);
  }

  const cta = document.createElement('span');
  cta.className = 'tire-search-card-cta';
  cta.textContent = 'View Details';
  body.append(cta);

  link.append(body);
  article.append(link);
  return article;
}

/**
 * @param {Element} block
 * @param {object} config
 * @param {TireSearchState} state
 */
function renderResults(block, config, state) {
  const summary = block.querySelector('.tire-search-summary');
  const grid = block.querySelector('.tire-search-results');
  const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = sortTires(
    filterTires(catalog, state.query, { brands: state.brands, categories: state.categories }),
    state.sort,
  );

  grid.replaceChildren();
  if (!state.query) {
    summary.textContent = config.placeholders.tireSearchPrompt
      || 'Search for tires by brand, name, or size.';
    grid.classList.add('tire-search-results--empty');
    return;
  }

  summary.textContent = filtered.length
    ? (config.placeholders.tireSearchResultsFor || '{count} results for "{query}"')
      .replace('{count}', String(filtered.length))
      .replace('{query}', state.query)
    : (config.placeholders.tireSearchNoResults || 'No tires found for "{query}".')
      .replace('{query}', state.query);

  if (!filtered.length) {
    grid.classList.add('tire-search-results--empty');
    const empty = document.createElement('div');
    empty.className = 'tire-search-empty';
    empty.innerHTML = `<p>${config.placeholders.tireSearchNoResultsHelp || 'Try a different brand or size, or <a href="/tires">shop all tires</a>.'}</p>`;
    grid.append(empty);
    return;
  }

  grid.classList.remove('tire-search-results--empty');
  filtered.forEach((tire) => grid.append(renderCard(tire, terms)));
}

/**
 * @param {Element} block
 * @param {Record<string, unknown>[]} tires
 */
function renderFilters(block, tires) {
  const facets = getFilterFacets(tires);
  const brandList = block.querySelector('.tire-search-filter-brands');
  const categoryList = block.querySelector('.tire-search-filter-categories');
  if (!brandList || !categoryList) return;

  brandList.replaceChildren();
  facets.brands.forEach((brand) => {
    const label = document.createElement('label');
    label.className = 'tire-search-filter-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'tire-search-filter-brand';
    input.value = brand;
    input.name = 'brand';
    label.append(input, document.createTextNode(` ${brand}`));
    brandList.append(label);
  });

  categoryList.replaceChildren();
  facets.categories.forEach((category) => {
    const label = document.createElement('label');
    label.className = 'tire-search-filter-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'tire-search-filter-category';
    input.value = category;
    input.name = 'category';
    label.append(input, document.createTextNode(` ${category}`));
    categoryList.append(label);
  });
}

/**
 * @param {Element} block
 * @param {object} config
 */
function bindEvents(block, config) {
  const run = () => {
    const state = readState(block);
    syncUrl(new URL(window.location.href), state);
    renderResults(block, config, state);
  };

  block.querySelector('.tire-search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });

  block.querySelector('.tire-search-sort')?.addEventListener('change', run);
  block.querySelector('.tire-search-filters')?.addEventListener('change', run);

  block.querySelector('.tire-search-clear-filters')?.addEventListener('click', () => {
    block.querySelectorAll('.tire-search-filter-brand:checked, .tire-search-filter-category:checked')
      .forEach((el) => { el.checked = false; });
    run();
  });
}

/**
 * @param {object} config
 */
function buildLayout(config) {
  const root = document.createElement('div');
  root.className = 'tire-search-layout';

  const toolbar = document.createElement('div');
  toolbar.className = 'tire-search-toolbar';

  const form = document.createElement('form');
  form.className = 'tire-search-form';
  form.setAttribute('role', 'search');
  form.method = 'get';
  form.action = '/search';

  const field = document.createElement('div');
  field.className = 'tire-search-field';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'text';
  input.className = 'tire-search-input';
  input.placeholder = config.placeholders.tireSearchPlaceholder || 'Search tires by brand, name, or size';
  input.setAttribute('aria-label', input.placeholder);
  input.autocomplete = 'off';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'tire-search-submit';
  submit.setAttribute('aria-label', 'Search');
  submit.innerHTML = '<span class="icon icon-search" aria-hidden="true"></span>';

  field.append(input, submit);
  form.append(field);

  const sortWrap = document.createElement('div');
  sortWrap.className = 'tire-search-sort-wrap';
  const sortLabel = document.createElement('label');
  sortLabel.className = 'tire-search-sort-label';
  sortLabel.textContent = 'Sort by';
  const sort = document.createElement('select');
  sort.className = 'tire-search-sort';
  sort.name = 'sort';
  sort.innerHTML = `
    <option value="best-match">Best Match</option>
    <option value="price-asc">Price: Low to High</option>
    <option value="price-desc">Price: High to Low</option>
    <option value="rating-desc">Highest Rated</option>
  `;
  sortLabel.append(sort);
  sortWrap.append(sortLabel);

  toolbar.append(form, sortWrap);

  const summary = document.createElement('p');
  summary.className = 'tire-search-summary';

  const body = document.createElement('div');
  body.className = 'tire-search-body';

  const filters = document.createElement('aside');
  filters.className = 'tire-search-filters';
  filters.setAttribute('aria-label', 'Filter results');
  filters.innerHTML = `
    <div class="tire-search-filter-group">
      <h2 class="tire-search-filter-heading">Brand</h2>
      <div class="tire-search-filter-brands"></div>
    </div>
    <div class="tire-search-filter-group">
      <h2 class="tire-search-filter-heading">Category</h2>
      <div class="tire-search-filter-categories"></div>
    </div>
    <button type="button" class="tire-search-clear-filters">Clear filters</button>
  `;

  const results = document.createElement('div');
  results.className = 'tire-search-results';
  results.setAttribute('role', 'list');

  body.append(filters, results);
  root.append(toolbar, summary, body);
  return root;
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const source = block.querySelector('a[href]')?.getAttribute('href') || DEFAULT_TIRE_INDEX;
  catalog = await fetchTireIndex(source);

  const config = { source, placeholders };
  block.replaceChildren(buildLayout(config));
  renderFilters(block, catalog);
  bindEvents(block, config);
  decorateIcons(block);

  const initialQuery = getSearchQueryFromUrl();
  const initialSort = new URLSearchParams(window.location.search).get('sort') || 'best-match';
  const input = block.querySelector('.tire-search-input');
  const sort = block.querySelector('.tire-search-sort');
  if (input && initialQuery) input.value = initialQuery;
  if (sort) sort.value = initialSort;
  renderResults(block, config, {
    query: initialQuery,
    sort: initialSort,
    brands: [],
    categories: [],
  });
}
