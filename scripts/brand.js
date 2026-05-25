/**
 * Hostname-based brand for shared DA content (America's Tire vs Discount Tire).
 * Discount Tire preview/prod hosts include "discounttire" in the hostname.
 *
 * Usage:
 * - **JS / blocks:** `import { getBrandConfig } from './brand.js'` or read `window.hlx.brand`
 *   after the first tick of `loadEager` (set by `registerSiteBrandOnWindow()`).
 * - **DA / HTML copy:** use placeholders `{{brand}}`, `{{brandPossessive}}`, and
 *   `{{brandLetter}}` in text or common attributes (alt, title, aria-label, placeholder);
 *   `expandBrandTokensInSubtree` replaces them per site.
 */

const AT_LOGO_URL = 'https://cdn.discounttire.com/sys-master/images/hc7/h2e/8808331149342/AT_logo.svg';
/** Same wordmark asset discounttire.com loads (not Scene7; avoids picture/src edge cases). */
const DT_LOGO_URL = 'https://cdn.discounttire.com/sys-master/images/hc5/h31/8808331083806/DT_logo.svg';

const SKIP_TEXT_PARENT_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG']);

/** @typedef {'americas-tire' | 'discount-tire'} SiteBrandKey */

/**
 * Single source of truth for display names and consumer URLs per site key.
 * Add fields here (e.g. `supportPhone`) and expose them from `getBrandConfig` /
 * `window.hlx.brand`.
 *
 * @type {Record<SiteBrandKey, { legalName: string, logoUrl: string, faviconHref: string,
 *   consumerHost: string }>}
 */
const BRAND_PROFILES = {
  'discount-tire': {
    legalName: 'Discount Tire',
    logoUrl: DT_LOGO_URL,
    faviconHref: 'https://www.discounttire.com/favicon.ico',
    consumerHost: 'www.discounttire.com',
  },
  'americas-tire': {
    legalName: "America's Tire",
    logoUrl: AT_LOGO_URL,
    faviconHref: 'https://www.americastire.com/favicon.ico',
    consumerHost: 'www.americastire.com',
  },
};

/**
 * @returns {SiteBrandKey}
 */
export function getSiteBrandKey() {
  const h = window.location.hostname.toLowerCase();
  if (h.includes('discounttire')) return 'discount-tire';
  return 'americas-tire';
}

/**
 * Active brand for this hostname (names, logo, favicon, consumer host).
 *
 * @returns {object} Brand config: key, legalName, legalNamePossessive, brandLetter, logoUrl,
 *   faviconHref, consumerHost
 */
export function getBrandConfig() {
  const key = getSiteBrandKey();
  const profile = BRAND_PROFILES[key];
  return {
    key,
    ...profile,
    legalNamePossessive: `${profile.legalName}'s`,
    brandLetter: key === 'discount-tire' ? 'D' : 'A',
  };
}

/**
 * Publishes `getBrandConfig()` on `window.hlx.brand` for blocks that cannot import ESM easily.
 */
export function registerSiteBrandOnWindow() {
  window.hlx = window.hlx || {};
  const cfg = getBrandConfig();
  window.hlx.brand = {
    key: cfg.key,
    legalName: cfg.legalName,
    legalNamePossessive: cfg.legalNamePossessive,
    brandLetter: cfg.brandLetter,
    logoUrl: cfg.logoUrl,
    faviconHref: cfg.faviconHref,
    consumerHost: cfg.consumerHost,
  };
}

const TOKEN_ATTRS = ['alt', 'title', 'aria-label', 'placeholder'];

/**
 * Replace `{{brand}}`, `{{brandPossessive}}`, `{{brand.possessive}}`, and `{{brandLetter}}`
 * with the active site values. `{{brandLetter}}` is expanded before `{{brand}}` so it is not
 * mangled.
 * @param {string} s
 */
export function replaceBrandTokens(s) {
  if (!s || typeof s !== 'string') return s;
  const { legalName, legalNamePossessive, brandLetter } = getBrandConfig();
  return s
    .split('{{brand.possessive}}')
    .join(legalNamePossessive)
    .split('{{brandPossessive}}')
    .join(legalNamePossessive)
    .split('{{brandLetter}}')
    .join(brandLetter)
    .split('{{brand}}')
    .join(legalName);
}

/**
 * Walk text + common attributes under `root` and expand brand tokens.
 * @param {Element|null} root
 */
export function expandBrandTokensInSubtree(root) {
  if (!root) return;

  const docRef = root.ownerDocument || document;
  const walker = docRef.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.includes('{{brand')) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p || SKIP_TEXT_PARENT_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n = walker.nextNode();
  while (n) {
    n.nodeValue = replaceBrandTokens(n.nodeValue);
    n = walker.nextNode();
  }

  root.querySelectorAll('*').forEach((el) => {
    TOKEN_ATTRS.forEach((attr) => {
      const v = el.getAttribute(attr);
      if (!v || !v.includes('{{brand')) return;
      el.setAttribute(attr, replaceBrandTokens(v));
    });
  });
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

  if (doc.title?.includes('{{brand')) {
    doc.title = replaceBrandTokens(doc.title);
  }

  doc.head?.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]').forEach((meta) => {
    const c = meta.getAttribute('content');
    if (c?.includes('{{brand')) meta.setAttribute('content', replaceBrandTokens(c));
  });

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

  const { logoUrl, legalName } = getBrandConfig();
  const logoAlt = `${legalName} logo`;
  const homeLabel = `${legalName} home`;
  // Nav fragment often uses ./media_*.svg (America's Tire art); force DT logo in header.
  root.querySelectorAll('.nav-brand img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const isAtAsset = src.includes('AT_logo') || src.includes('8808331149342');
    const isRelative = src.startsWith('./') || src.startsWith('../')
      || (src.startsWith('/') && !src.startsWith('//'));
    if (isAtAsset || isRelative) {
      img.src = logoUrl;
      img.removeAttribute('srcset');
      img.alt = logoAlt;
      const parentA = img.closest('a');
      if (parentA) parentA.setAttribute('aria-label', homeLabel);
    }
  });
  root.querySelectorAll('.nav-brand picture source').forEach((el) => el.remove());

  const docRef = root.ownerDocument || document;
  const walker = docRef.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p || SKIP_TEXT_PARENT_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node = walker.nextNode();
  while (node) {
    const next = applyBrandStringReplacements(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
    node = walker.nextNode();
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
