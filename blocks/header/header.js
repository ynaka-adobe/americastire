import { getMetadata } from '../../scripts/aem.js';
import { getBrandConfig } from '../../scripts/brand.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

const DEFAULT_MY_STORE_ADDRESS = '1155 El Camino Real - Millbrae';

/**
 * Point all brand images at the CDN logo; drop picture sources that override src.
 * If there is no img, append a home link with the logo.
 * @param {HTMLElement|null} navBrand
 */
function applyBrandLogo(navBrand) {
  if (!navBrand) return;

  const { logoUrl, legalName } = getBrandConfig();
  const logoAlt = `${legalName} logo`;
  const homeLabel = `${legalName} home`;

  navBrand.querySelectorAll('picture source').forEach((el) => {
    el.remove();
  });

  const imgs = navBrand.querySelectorAll('img');
  if (imgs.length > 0) {
    imgs.forEach((img) => {
      img.src = logoUrl;
      img.loading = 'eager';
      img.removeAttribute('srcset');
      img.alt = logoAlt;
      const parentA = img.closest('a');
      if (parentA) parentA.setAttribute('aria-label', homeLabel);
    });
    return;
  }

  const home = '/';
  const a = document.createElement('a');
  a.href = home;
  a.setAttribute('aria-label', homeLabel);
  const img = document.createElement('img');
  img.src = logoUrl;
  img.alt = logoAlt;
  img.width = 200;
  img.height = 50;
  img.loading = 'eager';
  a.append(img);
  navBrand.append(a);
}

/**
 * Top utility "My Store": pin, label, optional address (after colon in link text), chevron.
 * @param {HTMLLIElement} li
 */
function enhanceMyStoreLi(li) {
  const a = li.querySelector('a');
  if (!a?.getAttribute('href')) return;

  const raw = a.textContent.trim();
  let address = '';
  const match = raw.match(/^my store\s*:\s*(.*)$/i);
  if (match) {
    address = match[1].trim() || DEFAULT_MY_STORE_ADDRESS;
  } else if (/^my store$/i.test(raw)) {
    address = DEFAULT_MY_STORE_ADDRESS;
  } else {
    const stripped = raw.replace(/^my store\s*:?\s*/i, '').trim();
    address = stripped || DEFAULT_MY_STORE_ADDRESS;
  }

  a.classList.add('nav-my-store-link');
  a.setAttribute('aria-label', `My Store: ${address}. Opens store locator.`);

  const pin = document.createElement('span');
  pin.className = 'nav-my-store-pin';
  pin.setAttribute('aria-hidden', 'true');
  const pinSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" focusable="false">'
    + '<path fill="#c00" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>';
  pin.innerHTML = pinSvg;

  const textWrap = document.createElement('span');
  textWrap.className = 'nav-my-store-text';
  const labelEl = document.createElement('strong');
  labelEl.className = 'nav-my-store-label';
  labelEl.textContent = 'My Store:';
  const addr = document.createElement('span');
  addr.className = 'nav-my-store-address';
  addr.textContent = ` ${address}`;
  textWrap.append(labelEl, addr);

  const chevron = document.createElement('span');
  chevron.className = 'nav-my-store-chevron';
  chevron.setAttribute('aria-hidden', 'true');

  a.replaceChildren(pin, textWrap, chevron);
  li.classList.add('nav-my-store');
}

/**
 * "Need help?" — not a link; grey pill, black text, phone icon.
 * @param {HTMLLIElement} li
 */
function enhanceNeedHelpLi(li) {
  const a = li.querySelector('a');
  if (!a) return;
  const text = a.textContent.trim();
  li.classList.add('nav-need-help-item');

  const block = document.createElement('div');
  block.className = 'nav-need-help';

  const icon = document.createElement('span');
  icon.className = 'nav-need-help-icon';
  icon.setAttribute('aria-hidden', 'true');
  const phoneSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" '
    + 'fill="none" stroke="#111" stroke-width="2" focusable="false">'
    + '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 '
    + '1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'
    + '</svg>';
  icon.innerHTML = phoneSvg;

  const label = document.createElement('span');
  label.className = 'nav-need-help-text';
  label.textContent = text;

  block.append(icon, label);
  a.replaceWith(block);
}

/**
 * Prepend decorative icon to My Vehicles / Cart links in the tools row.
 * @param {HTMLElement} navTools
 */
function decorateNavToolIcons(navTools) {
  const list = navTools.querySelector('ul');
  if (!list) return;

  const vehicleSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" '
    + 'fill="none" stroke="#1a1a1a" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M5 17h14v-5l-2-4H7L5 12v5z"/><path d="M9 17v-3h6v3"/>'
    + '<circle cx="7.5" cy="17" r="1.25" fill="#1a1a1a" stroke="none"/>'
    + '<circle cx="16.5" cy="17" r="1.25" fill="#1a1a1a" stroke="none"/></svg>';

  const cartSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" '
    + 'fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<circle cx="9" cy="20" r="1"/><circle cx="20" cy="20" r="1"/>'
    + '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

  list.querySelectorAll(':scope > li').forEach((li) => {
    const a = li.querySelector('a');
    if (!a || a.querySelector('.nav-tool-icon')) return;
    const t = li.textContent.trim().toLowerCase();
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (t.startsWith('my vehicle') || href.includes('vehicle')) {
      const icon = document.createElement('span');
      icon.className = 'nav-tool-icon nav-tool-icon--vehicle';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = vehicleSvg;
      a.classList.add('nav-tool-link--with-icon');
      li.classList.add('nav-tool-vehicle-item');
      a.insertBefore(icon, a.firstChild);
    } else if (t.startsWith('cart') || (href.includes('cart') && !href.includes('search'))) {
      const icon = document.createElement('span');
      icon.className = 'nav-tool-icon nav-tool-icon--cart';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = cartSvg;
      a.classList.add('nav-tool-link--with-icon');
      li.classList.add('nav-tool-cart-item');
      a.insertBefore(icon, a.firstChild);
    }
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('.nav-hamburger button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  let navBrand = nav.querySelector('.nav-brand');
  if (!navBrand) {
    navBrand = document.createElement('div');
    navBrand.className = 'nav-brand';
    nav.prepend(navBrand);
  }

  // Strip button classes from brand; ensure a home logo exists when the nav fragment has no image
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
    applyBrandLogo(navBrand);
  }

  // Strip button classes from tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const container = btn.closest('.button-container');
      if (container) container.className = '';
    });
  }

  // Decorate nav sections (dropdowns)
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const container = btn.closest('.button-container');
      if (container) container.className = '';
    });

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Layout: brand column (full header height on desktop) |
  // top row (utility + tools) + bottom row (sections + search)
  const topActions = document.createElement('div');
  topActions.className = 'nav-top-actions';

  const bottomBar = document.createElement('div');
  bottomBar.className = 'nav-bottom-bar';

  if (navTools) {
    // Split tools: "My Store" and "Need help?" go to center utility area
    const utilityItems = [];
    const toolItems = [];
    const toolsList = navTools.querySelector('ul');
    if (toolsList) {
      toolsList.querySelectorAll(':scope > li').forEach((li) => {
        const text = li.textContent.trim().toLowerCase();
        if (text.startsWith('my store') || text.startsWith('need help')) {
          if (text.startsWith('my store')) {
            enhanceMyStoreLi(li);
          } else {
            enhanceNeedHelpLi(li);
          }
          utilityItems.push(li);
        } else {
          toolItems.push(li);
        }
      });
    }

    if (utilityItems.length > 0) {
      const utilityBar = document.createElement('div');
      utilityBar.className = 'nav-utility';
      const utilityList = document.createElement('ul');
      utilityItems.forEach((li) => utilityList.append(li));
      utilityBar.append(utilityList);
      topActions.append(utilityBar);
    }

    if (toolItems.length > 0 && toolsList) {
      toolsList.replaceChildren(...toolItems);
    }
    topActions.append(navTools);
  }

  // Move search from tools to bottom bar — magnifier opens flyout with search field
  if (navTools) {
    const searchItem = navTools.querySelector('a[href*="search"]');
    if (searchItem) {
      const searchHref = searchItem.getAttribute('href') || '/search';
      let searchUrl;
      try {
        searchUrl = new URL(searchHref, window.location.href);
      } catch {
        searchUrl = new URL('/search', window.location.href);
      }

      const searchContainer = document.createElement('div');
      searchContainer.className = 'nav-search';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-search-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', 'nav-search-flyout');
      trigger.setAttribute('aria-haspopup', 'dialog');
      const teaser = document.createElement('span');
      teaser.className = 'nav-search-teaser';
      teaser.textContent = 'What can we help you find?';
      const triggerIcon = document.createElement('span');
      triggerIcon.className = 'nav-search-icon';
      triggerIcon.setAttribute('aria-hidden', 'true');
      trigger.append(teaser, triggerIcon);

      const flyout = document.createElement('div');
      flyout.id = 'nav-search-flyout';
      flyout.className = 'nav-search-flyout';
      flyout.setAttribute('role', 'dialog');
      flyout.setAttribute('aria-label', 'Site search');
      flyout.hidden = true;

      const form = document.createElement('form');
      form.className = 'nav-search-form';
      form.action = searchUrl.pathname || '/search';
      form.method = 'get';
      form.setAttribute('role', 'search');

      searchUrl.searchParams.forEach((value, key) => {
        if (key !== 'q') {
          const h = document.createElement('input');
          h.type = 'hidden';
          h.name = key;
          h.value = value;
          form.append(h);
        }
      });

      const field = document.createElement('div');
      field.className = 'nav-search-field';

      const input = document.createElement('input');
      input.type = 'search';
      input.name = 'q';
      input.placeholder = 'What can we help you find?';
      input.setAttribute('autocomplete', 'off');
      input.className = 'nav-search-input';

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'nav-search-submit';
      submitBtn.setAttribute('aria-label', 'Submit search');
      const submitIcon = document.createElement('span');
      submitIcon.className = 'nav-search-icon';
      submitIcon.setAttribute('aria-hidden', 'true');
      submitBtn.append(submitIcon);

      field.append(input, submitBtn);
      form.append(field);

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'nav-search-cancel';
      cancelBtn.textContent = 'Cancel';

      flyout.append(form, cancelBtn);
      searchContainer.append(trigger, flyout);

      let docClickBound = false;
      let onDocClick;

      const closeSearch = () => {
        searchContainer.classList.remove('nav-search--open');
        flyout.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (docClickBound && onDocClick) {
          document.removeEventListener('click', onDocClick);
          docClickBound = false;
        }
      };

      onDocClick = (e) => {
        if (!searchContainer.contains(e.target)) {
          closeSearch();
        }
      };

      const openSearch = () => {
        searchContainer.classList.add('nav-search--open');
        flyout.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
          document.addEventListener('click', onDocClick);
          docClickBound = true;
        }, 0);
        input.focus();
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      });

      flyout.addEventListener('click', (e) => e.stopPropagation());

      cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSearch();
        trigger.focus();
      });

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
          closeSearch();
          trigger.focus();
        }
      });

      searchItem.closest('li')?.remove();
      bottomBar.append(searchContainer);
    }
    decorateNavToolIcons(navTools);
  }

  if (navSections) bottomBar.prepend(navSections);

  // Hamburger (mobile) lives in top actions row
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  topActions.prepend(hamburger);

  nav.replaceChildren(navBrand, topActions, bottomBar);
  nav.setAttribute('aria-expanded', 'false');

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
