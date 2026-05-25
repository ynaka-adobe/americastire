import { expandBrandTokensInSubtree } from '../../scripts/brand.js';

/**
 * @param {string} urlString
 * @returns {boolean}
 */
function isScene7Url(urlString) {
  try {
    const { hostname } = new URL(urlString, window.location.href);
    return hostname.includes('scene7.com');
  } catch {
    return false;
  }
}

/**
 * @param {HTMLElement} cell
 * @param {string} url
 * @param {string} alt
 */
function replaceCellWithScene7Img(cell, url, alt) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = alt || '';
  img.loading = 'eager';
  cell.replaceChildren(img);
}

/**
 * If the cell is not already a Helix <picture> and exposes a Scene7 asset URL (link or plain
 * text), replace the cell contents with an <img> so the strip shows the art.
 * @param {HTMLElement} cell
 */
function maybeRenderScene7Image(cell) {
  if (cell.querySelector(':scope picture')) return;

  const existingImg = cell.querySelector(':scope img');
  if (existingImg?.src && isScene7Url(existingImg.src)) return;

  const link = cell.querySelector(':scope a[href]');
  if (link && isScene7Url(link.href)) {
    replaceCellWithScene7Img(cell, link.href, link.textContent.trim());
    return;
  }

  const text = cell.textContent.trim();
  const urls = text.match(/https?:\/\/[^\s<>"']+/gi);
  const scene7 = urls?.find((u) => isScene7Url(u));
  if (scene7) replaceCellWithScene7Img(cell, scene7, '');
}

export default function decorate(block) {
  expandBrandTokensInSubtree(block);

  const row = block.firstElementChild;
  if (!row) return;
  const firstCell = row.firstElementChild;
  if (firstCell) {
    maybeRenderScene7Image(firstCell);
  }
  const cols = [...row.children];
  block.classList.add(`alert-${cols.length}-cols`);
}
