/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';
import {
  isPromoSchedulerPath,
  resolvePromoSchedulerFragment,
} from '../../scripts/promo-scheduler.js';

/**
 * @param {string} path
 */
async function resolveFragmentPath(path) {
  if (!path?.trim()) return null;
  const trimmed = path.trim();
  if (isPromoSchedulerPath(trimmed)) {
    return resolvePromoSchedulerFragment(trimmed);
  }
  return trimmed;
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement|null>} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // Media for fragments is stored at site root (/media_*), not under /fragments/.
      const mediaBase = new URL('/', window.location.href);
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), mediaBase).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

/**
 * @param {HTMLElement} fragment
 * @returns {Element[]}
 */
export function fragmentMountNodes(fragment) {
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  return sections.length ? sections : [...fragment.childNodes];
}

/**
 * Insert loaded fragment nodes in place of `host`.
 * @param {Element} host
 * @param {HTMLElement} fragment
 */
function mountFragmentNodes(host, fragment) {
  const nodes = fragmentMountNodes(fragment);
  const section = host.closest('.section');
  const firstSection = fragment.querySelector(':scope > .section');
  if (section && firstSection) {
    section.classList.add(...firstSection.classList);
  }
  host.replaceWith(...nodes);
}

/**
 * @param {string} path
 * @param {Element} host
 */
async function mountFragmentAt(path, host) {
  const resolved = await resolveFragmentPath(path);
  if (!resolved) return false;
  const fragment = await loadFragment(resolved);
  if (!fragment) return false;
  mountFragmentNodes(host, fragment);
  return true;
}

/**
 * Append loaded fragment sections into `host` (does not remove host).
 * @param {Element} host
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export async function appendFragmentInto(host, path) {
  const resolved = await resolveFragmentPath(path);
  if (!resolved) return false;
  const fragment = await loadFragment(resolved);
  if (!fragment) return false;
  host.append(...fragmentMountNodes(fragment));
  return true;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const host = block.classList.contains('fragment') ? block : block.closest('.fragment') || block;
  try {
    await mountFragmentAt(path, host);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
