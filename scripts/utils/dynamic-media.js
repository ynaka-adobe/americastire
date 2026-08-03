import { replaceBrandTokens } from '../brand.js';

/**
 * Dynamic Media rendering.
 *
 * When DA is configured with `aem.assets.image.type=link` (required so DM URLs bypass the
 * EDS Media Bus), Content Advisor inserts assets as plain links — e.g.
 *   <a href="https://delivery-pXXXX-eYYYY.adobeaemcloud.com/adobe/assets/urn:.../as/name.jpg">
 * or classic Scene7:
 *   <a href="https://<tenant>.scene7.com/is/image/...">
 * Nothing renders them as images by default, so this util detects those links (and bare-text
 * URLs) and swaps them for a responsive <picture>, using the query params each provider expects.
 */

const DEFAULT_BREAKPOINTS = [{ media: '(min-width: 600px)', width: 2000 }, { width: 750 }];

/** @returns {'openapi'|'scene7'|null} which DM provider a URL belongs to, or null. */
export function dmKind(urlString) {
  try {
    const { hostname, pathname } = new URL(urlString, window.location.href);
    if (hostname.includes('scene7.com')) return 'scene7';
    // AEM Assets delivery (OpenAPI / "darkalley"): delivery-*.adobeaemcloud.com/adobe/assets/...
    if (hostname.startsWith('delivery-') && pathname.includes('/adobe/assets/')) return 'openapi';
    return null;
  } catch {
    return null;
  }
}

/** @returns {boolean} true if the URL is a renderable Dynamic Media asset URL. */
export function isDynamicMediaUrl(urlString) {
  return dmKind(urlString) !== null;
}

/**
 * Return the URL with width/format params set the way the given provider expects, preserving
 * any params already present on the source URL.
 */
function withDMParams(urlString, width, kind) {
  const url = new URL(urlString, window.location.href);
  const { searchParams } = url;
  if (kind === 'scene7') {
    if (width) searchParams.set('wid', String(width));
    if (!searchParams.has('fmt')) searchParams.set('fmt', 'webp-alpha');
  } else {
    // openapi delivery
    if (width) searchParams.set('width', String(width));
    if (!searchParams.has('preferwebp')) searchParams.set('preferwebp', 'true');
  }
  return url.toString();
}

/**
 * Build a responsive <picture> for a Dynamic Media URL.
 * @param {string} src DM asset URL (openapi delivery or scene7)
 * @param {string} [alt]
 * @param {boolean} [eager]
 * @param {Array<{media?:string,width:number}>} [breakpoints]
 * @returns {HTMLPictureElement}
 */
export function createDMPicture(src, alt = '', eager = false, breakpoints = DEFAULT_BREAKPOINTS) {
  const url = replaceBrandTokens(src);
  const kind = dmKind(url) || 'openapi';
  const picture = document.createElement('picture');

  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', withDMParams(url, br.width, kind));
    picture.appendChild(source);
  });

  const last = breakpoints[breakpoints.length - 1];
  const img = document.createElement('img');
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('alt', replaceBrandTokens(alt || ''));
  img.setAttribute('src', withDMParams(url, last?.width, kind));
  picture.appendChild(img);

  return picture;
}

/**
 * Find Dynamic Media links (and bare-text DM URLs) in `root` and replace each with a rendered
 * <picture>. Run this before button decoration so DM links are not turned into CTAs.
 * @param {Element} root
 */
export function decorateDynamicMedia(root) {
  // Anchor links written by Content Advisor (image.type=link) or authored by hand.
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = replaceBrandTokens(a.getAttribute('href') || '');
    if (!isDynamicMediaUrl(href)) return;
    const alt = a.textContent.trim();
    // Use the link text as alt only when it is not just the URL echoed back.
    const eager = a.closest('.section') === root.querySelector('.section');
    a.replaceWith(createDMPicture(href, alt === href ? '' : alt, eager));
  });

  // Bare-text DM URLs sitting in their own paragraph/cell.
  root.querySelectorAll('p, div').forEach((el) => {
    if (el.children.length || el.querySelector('picture, img')) return;
    const text = el.textContent.trim();
    if (isDynamicMediaUrl(replaceBrandTokens(text))) {
      el.replaceChildren(createDMPicture(text));
    }
  });
}
