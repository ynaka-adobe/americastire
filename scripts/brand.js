/**
 * Hostname-based brand for shared DA content (America's Tire vs Discount Tire).
 * Discount Tire preview/prod hosts include "discounttire" in the hostname.
 */

const AT_LOGO_URL = 'https://cdn.discounttire.com/sys-master/images/hc7/h2e/8808331149342/AT_logo.svg';
const DT_LOGO_URL = 'https://discounttire.scene7.com/is/content/discounttire/logos/DT_logo.svg';

const SKIP_TEXT_PARENT_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG']);

/** @typedef {'americas-tire' | 'discount-tire'} SiteBrandKey */

/**
 * @returns {SiteBrandKey}
 */
export function getSiteBrandKey() {
  const h = window.location.hostname.toLowerCase();
  if (h.includes('discounttire')) return 'discount-tire';
  return 'americas-tire';
}

/**
 * @returns {{ key: SiteBrandKey, logoUrl: string, legalName: string, faviconHref: string }}
 */
export function getBrandConfig() {
  if (getSiteBrandKey() === 'discount-tire') {
    return {
      key: 'discount-tire',
      logoUrl: DT_LOGO_URL,
      legalName: 'Discount Tire',
      faviconHref: 'https://www.discounttire.com/favicon.ico',
    };
  }
  return {
    key: 'americas-tire',
    logoUrl: AT_LOGO_URL,
    legalName: "America's Tire",
    faviconHref: 'https://www.americastire.com/favicon.ico',
  };
}

/**
 * Apply string replacements (longer / more specific first).
 * @param {string} s
 */
function applyBrandStringReplacements(s) {
  return s
    .split('www.americastire.com')
    .join('www.discounttire.com')
    .split('americastire.com')
    .join('discounttire.com')
    .split('America’s Tire') // U+2019
    .join('Discount Tire')
    .split("America's Tire")
    .join('Discount Tire')
    .split('Americas Tire')
    .join('Discount Tire');
}

/**
 * Title, meta description, favicon — run once early in page load.
 * @param {Document} doc
 */
export function applyDocumentBrandTweaks(doc) {
  const fav = doc.querySelector('link[rel="icon"]');
  if (fav) {
    fav.setAttribute('href', getBrandConfig().faviconHref);
  }

  if (getSiteBrandKey() !== 'discount-tire') return;

  if (doc.title) {
    doc.title = applyBrandStringReplacements(doc.title);
  }

  doc.head?.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').forEach((meta) => {
    const c = meta.getAttribute('content');
    if (c) meta.setAttribute('content', applyBrandStringReplacements(c));
  });
}

const ATTRS_TO_REWRITE = ['alt', 'title', 'aria-label', 'placeholder'];

/**
 * Replace visible America's Tire strings in text nodes and common attributes.
 * Rewrites consumer links that still point at americastire.com.
 * @param {Element} root
 */
export function applySiteBrandToSubtree(root) {
  if (!root || getSiteBrandKey() !== 'discount-tire') return;

  const docRef = root.ownerDocument || document;
  const walker = docRef.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p || SKIP_TEXT_PARENT_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n = walker.nextNode();
  while (n) {
    const next = applyBrandStringReplacements(n.nodeValue);
    if (next !== n.nodeValue) n.nodeValue = next;
    n = walker.nextNode();
  }

  root.querySelectorAll('*').forEach((el) => {
    ATTRS_TO_REWRITE.forEach((attr) => {
      const v = el.getAttribute(attr);
      if (!v) return;
      const next = applyBrandStringReplacements(v);
      if (next !== v) el.setAttribute(attr, next);
    });
  });

  root.querySelectorAll('a[href*="americastire"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    const next = href.replace(/americastire/gi, 'discounttire');
    if (next !== href) a.setAttribute('href', next);
  });
}
