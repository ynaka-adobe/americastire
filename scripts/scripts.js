import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  readBlockConfig,
  toClassName,
  toCamelCase,
} from './aem.js';
import {
  applyDocumentBrandTweaks,
  applySiteBrandToSubtree,
  expandBrandTokensInSubtree,
  registerSiteBrandOnWindow,
} from './brand.js';
import { registerDemoDateOnWindow, syncDemoDateFromUrl } from './demo-date.js';
import { upgradePromoSchedulerLinks } from './promo-scheduler.js';

syncDemoDateFromUrl();

/** Block roots whose <picture> must not be stolen for synthetic .hero (see buildHeroBlock). */
const AUTO_HERO_SKIP_PICTURE = [
  '.alert', '.hero-promo', '.columns-split', '.cards-service', '.carousel-deals',
  '.cards', '.columns', '.carousel', '.fragment', '.accordion', '.accordion-faq',
  '.embed', '.video', '.quote', '.table', '.tabs',
].join(',');

/**
 * First <picture> in main before h1, not inside a known block (e.g. alert strip).
 * @param {Element} main
 * @param {Element} h1
 * @returns {HTMLPictureElement|null}
 */
function findAutoHeroPicture(main, h1) {
  const pics = main.querySelectorAll('picture');
  for (let i = 0; i < pics.length; i += 1) {
    const pic = pics[i];
    // eslint-disable-next-line no-bitwise
    const precedes = (h1.compareDocumentPosition(pic) & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
    if (precedes && !pic.closest(AUTO_HERO_SKIP_PICTURE)) {
      return pic;
    }
  }
  return null;
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = h1 ? findAutoHeroPicture(main, h1) : null;
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    if (!main.querySelector('.hero')) buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 */
function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.classList.contains('richtext')) {
        e.removeAttribute('class');
        if (!defaultContent) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('default-content-wrapper');
          wrappers.push(wrapper);
          defaultContent = true;
        }
      } else if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });

    // Add wrapped content back
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';

    // Process section metadata
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta.style
            .split(',')
            .filter((style) => style)
            .map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

/**
 * "Schedule a Service Appointment" → outlined red button
 * (distinct from other /schedule-appointment links).
 * @param {Element} main
 */
function decorateScheduleServiceAppointmentCTA(main) {
  const label = 'Schedule a Service Appointment';
  main.querySelectorAll('a[href*="schedule-appointment"]').forEach((a) => {
    if (a.textContent.trim() !== label) return;
    if (a.closest('.schedule-services-ctas')) return;
    a.classList.add('button', 'button-schedule-service');
    const p1 = a.parentElement;
    if (p1?.tagName === 'P' && p1.childElementCount === 1 && p1.firstElementChild === a) {
      p1.classList.add('button-container');
    }
    const p2 = p1?.nextElementSibling;
    if (p2?.tagName !== 'P') return;
    const nextLink = p2.querySelector(':scope > a[href*="services"]');
    if (!nextLink || p2.childElementCount !== 1 || nextLink !== p2.firstElementChild) return;
    const wrap = document.createElement('div');
    wrap.className = 'schedule-services-ctas';
    p1.parentElement.insertBefore(wrap, p1);
    wrap.append(p1, p2);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateScheduleServiceAppointmentCTA(main);
  decorateBlocks(main);
  expandBrandTokensInSubtree(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  applyDocumentBrandTweaks(doc);
  registerSiteBrandOnWindow();
  registerDemoDateOnWindow();
  doc.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    doc.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);
  await upgradePromoSchedulerLinks(main);
  applySiteBrandToSubtree(main);
  expandBrandTokensInSubtree(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  await loadHeader(doc.querySelector('header'));
  await loadFooter(doc.querySelector('footer'));
  applySiteBrandToSubtree(doc.querySelector('header'));
  applySiteBrandToSubtree(doc.querySelector('footer'));
  expandBrandTokensInSubtree(doc.querySelector('header'));
  expandBrandTokensInSubtree(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadSidekick() {
  if (document.querySelector('aem-sidekick')) {
    import('./sidekick.js');
    return;
  }

  document.addEventListener('sidekick-ready', () => {
    import('./sidekick.js');
  });
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  loadSidekick();
}

// UE Editor support before page load
if (/\.(stage-ue|ue)\.da\.live$/.test(window.location.hostname)) {
  // eslint-disable-next-line import/no-unresolved
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);

  const lp = searchParams.get('dapreview');
  // eslint-disable-next-line import/no-unresolved
  if (lp) import('https://da.live/scripts/dapreview.js').then((mod) => mod.default(loadPage));

  const exp = searchParams.get('daexperiment');
  // eslint-disable-next-line import/no-unresolved
  if (exp) import('https://da.live/nx/public/plugins/exp/exp.js');
}());
