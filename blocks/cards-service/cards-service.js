import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Compact vertical tiles for Shop by Category (or when block is authored with `category`).
 * Detects preceding heading in the same section row (direct h1–h6 or inside default-content-wrapper).
 */
function applyCategoryVariant(block) {
  if (block.classList.contains('category')) return;
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (!prev) return;
  let heading = null;
  if (prev.classList?.contains('default-content-wrapper')) {
    heading = prev.querySelector('h1, h2, h3, h4, h5, h6');
  } else if (/^H[1-6]$/i.test(prev.tagName)) {
    heading = prev;
  }
  if (!heading) return;
  if (/shop\s+by\s+category/i.test(heading.textContent.trim())) {
    block.classList.add('category');
  }
}

/**
 * Life of Tire service tiles (or block class `service`): copy on top, photo on bottom, 266×246.
 */
function applyServiceVariant(block) {
  if (block.classList.contains('service') || block.classList.contains('category')) return;
  const wrapper = block.parentElement;
  const section = block.closest('.section');
  if (!section || !wrapper) return;

  const life = [...section.querySelectorAll('h1, h2, h3, h4, h5, h6')].find(
    (h) => /life\s+of\s+tire\s+services/i.test(h.textContent) && /every\s+tire\s+purchase/i.test(h.textContent),
  );
  if (!life) return;

  let node = life.nextElementSibling;
  while (node) {
    if (/^H[1-6]$/i.test(node.tagName)) break;
    if (node === wrapper || (typeof node.contains === 'function' && node.contains(block))) {
      block.classList.add('service');
      return;
    }
    node = node.nextElementSibling;
  }
}

/** Table rows often ship an empty first cell when the icon was never authored — remove so layout can run. */
function removeLeadingEmptyCells(li) {
  let child = li.firstElementChild;
  while (child) {
    const hasMedia = child.querySelector('picture, img, svg, video, iframe');
    const text = (child.textContent || '').replace(/\s+/g, '');
    if (hasMedia || text.length > 0) break;
    const next = child.nextElementSibling;
    child.remove();
    child = next;
  }
}

function hoistLeadingPictureIntoImageColumn(li) {
  if (li.querySelector(':scope > .cards-service-card-image')) return;
  const body = li.querySelector(':scope > .cards-service-card-body');
  if (!body) return;
  const first = body.firstElementChild;
  if (!first) return;
  let host = null;
  if (first.tagName === 'PICTURE' && first.querySelector('img')) {
    host = first;
  } else if (first.tagName === 'P' && first.querySelector(':scope > picture')) {
    const pics = first.querySelectorAll('picture');
    if (pics.length === 1 && first.children.length === 1) host = first;
  } else if (first.tagName === 'DIV' && first.children.length === 1 && first.querySelector(':scope > picture')) {
    host = first;
  }
  if (!host) return;
  const wrap = document.createElement('div');
  wrap.className = 'cards-service-card-image';
  wrap.append(host);
  li.prepend(wrap);
}

/** index.plain.html row 1 has an empty image cell — add repo shield so grid + CSS apply. */
function ensureDefaultIconIfMissing(li, rowIndex, block) {
  if (block.classList.contains('service')) return;
  if (li.querySelector(':scope > .cards-service-card-image')) return;
  const prefix = window.hlx?.codeBasePath || '';
  const icon =
    rowIndex === 0 ? 'cards-service-shield-check.svg' : rowIndex === 2 ? 'cards-service-price-promise.svg' : null;
  if (!icon) return;
  const wrap = document.createElement('div');
  wrap.className = 'cards-service-card-image';
  const img = document.createElement('img');
  img.src = `${prefix}/icons/${icon}`;
  img.alt = '';
  wrap.append(img);
  li.prepend(wrap);
}

/** Card 3 — "Online | In-Store" row with monitor + storefront icons (matches americastire.com). */
function decorateCard3OnlineInStore(li, rowIndex) {
  if (rowIndex !== 2) return;
  const body = li.querySelector(':scope > .cards-service-card-body');
  if (!body) return;
  const prefix = window.hlx?.codeBasePath || '';
  [...body.querySelectorAll('p')].forEach((p) => {
    if (p.querySelector('img') || p.classList.contains('cards-service-online-in-store')) return;
    const raw = p.textContent.trim();
    if (!/\bonline\b/i.test(raw) || !/\bin\s*-?\s*store\b/i.test(raw)) return;
    const parts = raw.includes('|') ? raw.split(/\s*\|\s*/) : null;
    if (!parts || parts.length < 2) return;
    p.classList.add('cards-service-online-in-store');
    p.textContent = '';
    const row = document.createElement('span');
    row.className = 'cards-service-online-in-store__row';
    const online = document.createElement('span');
    online.className = 'cards-service-online-in-store__item';
    const imgOn = document.createElement('img');
    imgOn.src = `${prefix}/icons/cards-service-icon-online.svg`;
    imgOn.alt = '';
    imgOn.className = 'cards-service-online-in-store__icon';
    online.append(imgOn, document.createTextNode(parts[0].trim()));
    const divider = document.createElement('span');
    divider.className = 'cards-service-online-in-store__divider';
    divider.setAttribute('aria-hidden', 'true');
    const instore = document.createElement('span');
    instore.className = 'cards-service-online-in-store__item';
    const imgSt = document.createElement('img');
    imgSt.src = `${prefix}/icons/cards-service-icon-in-store.svg`;
    imgSt.alt = '';
    imgSt.className = 'cards-service-online-in-store__icon';
    instore.append(imgSt, document.createTextNode(parts[1].trim()));
    row.append(online, divider, instore);
    p.append(row);
  });
}

export default function decorate(block) {
  applyCategoryVariant(block);
  applyServiceVariant(block);
  const ul = document.createElement('ul');
  [...block.children].forEach((row, rowIndex) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    removeLeadingEmptyCells(li);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-service-card-image';
      else div.className = 'cards-service-card-body';
    });
    hoistLeadingPictureIntoImageColumn(li);
    ensureDefaultIconIfMissing(li, rowIndex, block);
    decorateCard3OnlineInStore(li, rowIndex);
    ul.append(li);
  });
  let pictureWidths = [{ width: '750' }];
  if (block.classList.contains('category')) pictureWidths = [{ width: '250' }];
  else if (block.classList.contains('service')) pictureWidths = [{ width: '266' }, { width: '532' }];
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, pictureWidths);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
