import { createOptimizedPicture } from '../../scripts/aem.js';

/** Logos imported from discounttire.com .AEM-hp-shopByBrand */
const LOCAL_BRAND_SLUGS = new Set([
  'michelin', 'goodyear', 'continental', 'falken', 'bfgoodrich', 'yokohama',
]);

/** Common authoring typos → icon file slug */
const BRAND_SLUG_ALIASES = {
  yokoyama: 'yokohama',
};

/**
 * @param {string} slug
 */
function normalizeBrandSlug(slug) {
  const key = (slug || '').toLowerCase().replace(/\s+/g, '');
  return BRAND_SLUG_ALIASES[key] || key;
}

/**
 * @param {string} value
 */
function brandSlugFromHref(value) {
  if (!value || value === '#') return '';
  try {
    const url = new URL(value, window.location.origin);
    const fromPath = url.pathname.match(/\/brands\/([^/]+)/i);
    if (fromPath) return normalizeBrandSlug(fromPath[1]);
    const fromParam = url.searchParams.get('brand');
    if (fromParam) return normalizeBrandSlug(fromParam);
  } catch {
    // relative href
  }
  const relPath = value.match(/\/brands\/([^/?#]+)/i);
  if (relPath) return normalizeBrandSlug(relPath[1]);
  const relParam = value.match(/[?&]brand=([^&]+)/i);
  if (relParam) return normalizeBrandSlug(decodeURIComponent(relParam[1]));
  return '';
}

/**
 * @param {string} href
 * @param {string} label
 */
function resolveBrandSlug(href, label) {
  return brandSlugFromHref(href) || brandSlugFromHref(label) || normalizeBrandSlug(label);
}

/**
 * @param {string} slug
 */
function localBrandLogoSrc(slug) {
  const normalized = normalizeBrandSlug(slug);
  if (!normalized || !LOCAL_BRAND_SLUGS.has(normalized)) return null;
  const prefix = window.hlx?.codeBasePath || '';
  return `${prefix}/icons/shop-by-brand/${normalized}.svg`;
}

/**
 * @param {string} slug
 */
function brandAriaLabel(slug) {
  const name = slug.replace(/^./, (c) => c.toUpperCase());
  return `Shop ${name} brand tires`;
}

/**
 * @param {string} text
 */
function looksLikeUrlOrPath(text) {
  return /^https?:\/\//i.test(text) || text.startsWith('/') || text.includes('?brand=');
}

/**
 * @param {HTMLAnchorElement} anchor
 * @param {string} src
 * @param {string} alt
 */
function appendBrandLogoImg(anchor, src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  anchor.append(img);
}

/**
 * @param {Element} row
 */
function isHeadingRow(row) {
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const hasMedia = row.querySelector('picture, img, svg');
  return Boolean(heading && !hasMedia);
}

/**
 * @param {Element} cell
 */
function getLinkFromCell(cell) {
  if (!cell) return null;
  const link = cell.querySelector('a[href]');
  if (link) {
    const href = link.getAttribute('href') || '#';
    const label = (link.getAttribute('aria-label') || link.textContent || '').trim();
    return { href, label: label || href };
  }
  const text = (cell.textContent || '').trim();
  if (!text) return null;
  // DA rows often ship bare paths like /search?brand=Michelin (no <a>)
  if (looksLikeUrlOrPath(text)) {
    return { href: text, label: '' };
  }
  return {
    href: `/search?brand=${encodeURIComponent(text)}`,
    label: text,
  };
}

/**
 * @param {Element} cell
 * @returns {Element|null}
 */
function getMediaFromCell(cell) {
  if (!cell) return null;
  return cell.querySelector('picture, img, svg');
}

/**
 * @param {Element} block
 * @returns {HTMLHeadingElement|null}
 */
function findSectionHeading(block) {
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (!prev) return null;
  if (prev.classList?.contains('default-content-wrapper')) {
    return prev.querySelector('h1, h2, h3, h4, h5, h6');
  }
  if (/^H[1-6]$/i.test(prev.tagName)) return prev;
  return null;
}

export default function decorate(block) {
  const rows = [...block.children];
  let headingRow = null;
  if (rows.length && isHeadingRow(rows[0])) {
    headingRow = rows.shift();
  }

  const ul = document.createElement('ul');
  rows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells[0];
    const bodyCell = cells[1] || cells[0];
    const media = getMediaFromCell(imageCell) || getMediaFromCell(bodyCell);
    const link = getLinkFromCell(bodyCell) || getLinkFromCell(imageCell);
    if (!media && !link) return;

    const li = document.createElement('li');
    const anchor = document.createElement('a');
    const href = link?.href && link.href !== '#' ? link.href : '';
    const slug = resolveBrandSlug(href, link?.label || '');
    if (href) anchor.href = href;
    else if (slug) anchor.href = `/search?brand=${encodeURIComponent(slug)}`;
    const label = link?.label || (slug ? brandAriaLabel(slug) : '');
    if (label && !looksLikeUrlOrPath(label)) {
      anchor.setAttribute('aria-label', label);
    } else if (slug) {
      anchor.setAttribute('aria-label', brandAriaLabel(slug));
    }

    if (media) {
      if (media.tagName === 'PICTURE') {
        const img = media.querySelector('img');
        if (img?.src) {
          anchor.append(createOptimizedPicture(img.src, img.alt || label, false, [{ width: '250' }]));
        } else {
          anchor.append(media.cloneNode(true));
        }
      } else if (media.tagName === 'IMG' && media.src) {
        if (media.src.endsWith('.svg')) {
          appendBrandLogoImg(anchor, media.src, media.alt || label);
        } else {
          anchor.append(createOptimizedPicture(media.src, media.alt || label, false, [{ width: '250' }]));
        }
      } else if (media.tagName === 'SVG') {
        const svg = media.cloneNode(true);
        if (!svg.getAttribute('role')) svg.setAttribute('role', 'img');
        anchor.append(svg);
      }
    } else {
      const localLogo = localBrandLogoSrc(slug);
      const alt = slug ? brandAriaLabel(slug) : label;
      if (localLogo) {
        appendBrandLogoImg(anchor, localLogo, alt);
      } else if (slug) {
        const fallback = document.createElement('span');
        fallback.className = 'shop-by-brand-fallback';
        fallback.textContent = slug.replace(/^./, (c) => c.toUpperCase());
        anchor.append(fallback);
      } else if (label && !looksLikeUrlOrPath(label)) {
        const fallback = document.createElement('span');
        fallback.className = 'shop-by-brand-fallback';
        fallback.textContent = label
          .replace(/^shop\s+/i, '')
          .replace(/\s+brand\s+tires$/i, '');
        anchor.append(fallback);
      }
    }

    li.append(anchor);
    ul.append(li);
  });

  block.textContent = '';
  if (headingRow) {
    const heading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) block.append(heading.cloneNode(true));
  }
  block.append(ul);

  if (!block.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')) {
    const sectionHeading = findSectionHeading(block);
    if (sectionHeading) block.classList.add('has-section-heading');
  }
}
